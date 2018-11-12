const { connection, userServices, userServiceIdentifiers, invitationServices, invitationServiceIdentifiers, policies, policyConditions, policyRoles, roles } = require('./organisationsRepository');
const { Op, QueryTypes } = require('sequelize');
const { mapUserServiceEntities, mapUserServiceEntity, mapPolicyEntities, mapPolicyEntity, mapRoleEntities } = require('./mappers');
const uuid = require('uuid/v4');

const getUserServices = async (uid) => {
  const entities = await userServices.findAll({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
    },
    order: ['service_id', 'organisation_id'],
  });
  return mapUserServiceEntities(entities);
};

const getUserService = async (uid, sid, oid) => {
  const entities = await userServices.find({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
  return mapUserServiceEntity(entities);
};

const addUserService = async (uid, sid, oid) => {
  const existing = await userServices.find({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
  if (!existing) {
    const id = uuid();
    await userServices.create({
      id,
      status: 1,
      user_id: uid,
      organisation_id: oid,
      service_id: sid,
    });
    return id;
  } else {
    return existing.id;
  }
};

const addUserServiceIdentifier = async (uid, sid, oid, key, value) => {
  await userServiceIdentifiers.upsert({
    user_id: uid,
    organisation_id: oid,
    service_id: sid,
    identifier_key: key,
    identifier_value: value,
  });
};

const getUserOfServiceIdentifier = async (sid, key, value) => {
  const entity = await userServiceIdentifiers.find({
    where: {
      service_id: {
        [Op.eq]: sid,
      },
      identifier_key: {
        [Op.eq]: key,
      },
      identifier_value: {
        [Op.eq]: value,
      },
    }
  });
  if (entity) {
    return entity.user_id;
  }
  return undefined;
};

const removeAllUserServiceIdentifiers = async (uid, sid, oid) => {
  await userServiceIdentifiers.destroy({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
};

const removeUserService = async (uid, sid, oid) => {
  await userServices.destroy({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
};

// TODO: re-enable tests once we can update model to support sequelize relationships
const getUsersOfServicePaged = async (sid, filters, pageNumber, pageSize) => {
  let queryFrom = 'FROM [dbo].[user_services] AS [user_services]';
  let queryWhere = 'WHERE [user_services].[service_id] = :sid';
  const queryOpts = {
    type: QueryTypes.SELECT,
    replacements: { sid },
  };

  if (filters) {
    let needsIdentifiersJoin = false;

    if (filters.idkey) {
      queryWhere += ` AND [user_service_identifiers].[identifier_key] = :idkey`;
      queryOpts.replacements.idkey = filters.idkey;
      needsIdentifiersJoin = true;
    }

    if (filters.idvalue) {
      queryWhere += ` AND [user_service_identifiers].[identifier_value] = :idvalue`;
      queryOpts.replacements.idvalue = filters.idvalue;
      needsIdentifiersJoin = true;
    }

    if (needsIdentifiersJoin) {
      queryFrom += ' INNER JOIN [user_service_identifiers] AS [user_service_identifiers] ' +
        'ON [user_services].[user_id] = [user_service_identifiers].[user_id] ' +
        'AND [user_services].[organisation_id] = [user_service_identifiers].[organisation_id] ' +
        'AND [user_services].[service_id] = [user_service_identifiers].[service_id] ';
    }
  }

  const count = (await connection.query(`SELECT COUNT(DISTINCT [id]) AS [count] ${queryFrom} ${queryWhere};`, queryOpts))[0].count;
  const rows = await connection.query(`SELECT DISTINCT [user_services].* ${queryFrom} ${queryWhere} ORDER BY [user_services].user_id, [user_services].organisation_id`,
    Object.assign({ model: userServices }, queryOpts));
  return {
    services: await mapUserServiceEntities(rows),
    page: pageNumber,
    totalNumberOfPages: Math.ceil(count / pageSize),
    totalNumberOfRecords: count,
  };
};

const getPageOfUserServices = async (pageNumber, pageSize) => {
  const resultset = await userServices.findAndCountAll({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: ['user_id', 'service_id', 'organisation_id'],
  });
  const services = await mapUserServiceEntities(resultset.rows);
  return {
    services,
    numberOfPages: Math.ceil(resultset.count / pageSize),
  };
};


const addInvitationService = async (iid, sid, oid) => {
  const existing = await invitationServices.find({
    where: {
      invitation_id: {
        [Op.eq]: iid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
  if (!existing) {
    const id = uuid();
    await invitationServices.create({
      id,
      invitation_id: iid,
      organisation_id: oid,
      service_id: sid,
    });
    return id;
  } else {
    return existing.id;
  }
};

const addInvitationServiceIdentifier = async (iid, sid, oid, key, value) => {
  await invitationServiceIdentifiers.upsert({
    invitation_id: iid,
    organisation_id: oid,
    service_id: sid,
    identifier_key: key,
    identifier_value: value,
  });
};

const removeInvitationService = async (iid, sid, oid) => {
  await invitationServices.destroy({
    where: {
      invitation_id: {
        [Op.eq]: iid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
};

const removeAllInvitationServiceIdentifiers = async (iid, sid, oid) => {
  await invitationServiceIdentifiers.destroy({
    where: {
      invitation_id: {
        [Op.eq]: iid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
};

const getInvitationServices = async (iid) => {
  const entities = await invitationServices.findAll({
    where: {
      invitation_id: {
        [Op.eq]: iid,
      },
    },
    order: ['service_id', 'organisation_id'],
  });
  return mapUserServiceEntities(entities);
};

const getInvitationService = async (iid, sid, oid) => {
  const entities = await invitationServices.find({
    where: {
      invitation_id: {
        [Op.eq]: iid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      organisation_id: {
        [Op.eq]: oid,
      },
    },
  });
  return mapUserServiceEntity(entities);
};

const getPageOfInvitationServices = async (pageNumber, pageSize) => {
  const resultset = await invitationServices.findAndCountAll({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: ['invitation_id', 'service_id', 'organisation_id'],
  });
  const services = await mapUserServiceEntities(resultset.rows);
  return {
    services,
    numberOfPages: Math.ceil(resultset.count / pageSize),
  };
};


const getPoliciesForService = async (sid) => {
  const entities = await policies.findAll({
    where: {
      applicationId: {
        [Op.eq]: sid
      },
    },
    include: ['conditions', 'roles'],
    order: ['name'],
  });
  return await mapPolicyEntities(entities);
};

const getPolicy = async (id) => {
  const entity = await policies.find({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
    include: ['conditions', 'roles'],
  });
  return mapPolicyEntity(entity);
};

const addPolicy = async (id, name, sid, status) => {
  await policies.upsert({
    id,
    name,
    applicationId: sid,
    status,
  });
};

const addPolicyCondition = async (id, pid, field, operator, value) => {
  await policyConditions.upsert({
    id,
    policyId: pid,
    field,
    operator,
    value,
  });
};

const addPolicyRole = async (pid, rid) => {
  await policyRoles.upsert({
    policyId: pid,
    roleId: rid,
  });
};

const deletePolicy = async (pid) => {
  await policies.destroy({
    where: {
      id: {
        [Op.eq]: pid,
      },
    },
  });
};

const deletePolicyConditions = async (pid) => {
  await policyConditions.destroy({
    where: {
      policyId: {
        [Op.eq]: pid,
      },
    },
  });
};

const deletePolicyRoles = async (pid) => {
  await policyRoles.destroy({
    where: {
      policyId: {
        [Op.eq]: pid,
      },
    },
  });
};

const getServiceRoles = async (sid) => {
  const entities = await roles.findAll({
    where: {
      applicationId: {
        [Op.eq]: sid
      },
    },
    order: ['name'],
  });
  if (!entities || entities.length === 0) {
    return [];
  }
  return await mapRoleEntities(entities);
};

module.exports = {
  getUserServices,
  getUserService,
  addUserService,
  addUserServiceIdentifier,
  getUserOfServiceIdentifier,
  removeAllUserServiceIdentifiers,
  removeUserService,
  getUsersOfServicePaged,
  getPageOfUserServices,
  addInvitationService,
  addInvitationServiceIdentifier,
  removeAllInvitationServiceIdentifiers,
  getInvitationServices,
  getPageOfInvitationServices,
  getPoliciesForService,
  getPolicy,
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
  deletePolicy,
  deletePolicyConditions,
  deletePolicyRoles,
  getServiceRoles,
  getInvitationService,
  removeInvitationService,
};
