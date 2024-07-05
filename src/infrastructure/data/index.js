const { Op, QueryTypes } = require('sequelize');
const uuid = require('uuid');

const {
  connection, userServices, userServiceIdentifiers, invitationServices, invitationServiceIdentifiers, policies, policyConditions, policyRoles, roles, userServiceRequests, userServiceRoles, invitationServiceRoles,
} = require('./organisationsRepository');

const {
  mapUserServiceEntities, mapUserServiceEntity, mapPolicyEntities, mapPolicyEntity, mapRoleEntities, mapUserServiceRoles, 
} = require('./mappers');

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
  const entities = await userServices.findOne({
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
  const existing = await userServices.findOne({
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
    const id = uuid.v4();
    await userServices.create({
      id,
      status: 1,
      user_id: uid,
      organisation_id: oid,
      service_id: sid,
    });
    return id;
  }
  return existing.id;
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
  const entity = await userServiceIdentifiers.findOne({
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
    },
  });
  if (entity) {
    return entity.user_id;
  }
  return undefined;
};

const removeAllUserServiceGroupIdentifiers = async (uid, sid, oid) => {
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
      identifier_key: {
        [Op.eq]: 'groups',
      },
    },
  });
};

const addGroupsToUserServiceIdentifier = async (uid, sid, oid, value) => {
  await userServiceIdentifiers.upsert({
    user_id: uid,
    organisation_id: oid,
    service_id: sid,
    identifier_key: 'groups',
    identifier_value: value,
  });
};

const executeWithTransaction = async (action, uid, sid, oid, batchTransaction) => {
  const transaction = batchTransaction ?? await sequelize.transaction();
  try {
    await action(uid, sid, oid, transaction);
    if (!batchTran) {
      await transaction.commit();
    }
  } catch (error) {
    if (!batchTran) {
      await transaction.rollback();
    }
    throw error;
  }
};

const removeAllUserServiceRequests = async (uid, sid, oid, batchTransaction) => {
  const transaction = batchTransaction ?? await sequelize.transaction();
  await userServiceRequests.destroy({
    where: {
      user_id: uid,
      service_id: sid,
      organisation_id: oid,
    },
  }, { transaction });
};

const removeAllUserServiceRoles = async (uid, sid, oid, batchTransaction) => {
  const transaction = batchTransaction ?? await sequelize.transaction();
  await userServiceRoles.destroy({
    where: {
      user_id: uid,
      service_id: sid,
      organisation_id: oid,
    },
  }, { transaction });
};

const removeAllUserServiceIdentifiers = async (uid, sid, oid, batchTransaction) => {
  const transaction = batchTransaction ?? await sequelize.transaction();
  await userServiceIdentifiers.destroy({
    where: {
      user_id: uid,
      service_id: sid,
      organisation_id: oid,
    },
  }, { transaction });
};

const removeUserService = async (uid, sid, oid, batchTransaction) => {
  const transaction = batchTransaction ?? await sequelize.transaction();
  await userServices.destroy({
    where: {
      user_id: uid,
      service_id: sid,
      organisation_id: oid,
    },
  }, { transaction });
};

const removeUserServiceAndAssociations = async (uid, sid, oid) => {
  const logger = require('./../logger');
  try {
    await sequelize.transaction(async t => {
      await executeWithTransaction(removeAllUserServiceRequests, uid, sid, oid, t);
      await executeWithTransaction(removeAllUserServiceRoles, uid, sid, oid, t);
      await executeWithTransaction(removeAllUserServiceIdentifiers, uid, sid, oid, t);
      await executeWithTransaction(removeUserService, uid, sid, oid, t);
    });
  } catch (e) {
    logger.error(`Error removing service: ${sid} with org: ${oid} from user: ${uid} - ${e.message}`, {
      stack: e.stack
    });
    throw e;
  }
};

// TODO: re-enable tests once we can update model to support sequelize relationships
const getUsersOfServicePaged = async (sid, oid, filters, pageNumber, pageSize) => {
  let queryFrom = 'FROM [dbo].[user_services] AS [user_services]';
  let queryWhere = 'WHERE [user_services].[service_id] = :sid';
  const queryOpts = {
    type: QueryTypes.SELECT,
    replacements: { sid },
  };

  if (oid) {
    queryOpts.replacements.oid = oid;
    queryWhere += ' AND [user_services].[organisation_id] = :oid';
  }

  if (filters) {
    let needsIdentifiersJoin = false;

    if (filters.idkey) {
      queryWhere += ' AND [user_service_identifiers].[identifier_key] = :idkey';
      queryOpts.replacements.idkey = filters.idkey;
      needsIdentifiersJoin = true;
    }

    if (filters.idvalue) {
      queryWhere += ' AND [user_service_identifiers].[identifier_value] = :idvalue';
      queryOpts.replacements.idvalue = filters.idvalue;
      needsIdentifiersJoin = true;
    }

    if (needsIdentifiersJoin) {
      queryFrom += ' INNER JOIN [user_service_identifiers] AS [user_service_identifiers] '
        + 'ON [user_services].[user_id] = [user_service_identifiers].[user_id] '
        + 'AND [user_services].[organisation_id] = [user_service_identifiers].[organisation_id] '
        + 'AND [user_services].[service_id] = [user_service_identifiers].[service_id] ';
    }
  }

  const { count } = (await connection.query(`SELECT COUNT(DISTINCT [id]) AS [count] ${queryFrom} ${queryWhere};`, queryOpts))[0];
  const rows = await connection.query(
    `SELECT DISTINCT [user_services].* ${queryFrom} ${queryWhere} ORDER BY [user_services].user_id, [user_services].organisation_id`,
    { model: userServices, ...queryOpts },
  );
  return {
    services: await mapUserServiceEntities(rows),
    page: pageNumber,
    totalNumberOfPages: Math.ceil(count / pageSize),
    totalNumberOfRecords: count,
  };
};

const getUsersOfServicePagedV2 = async (sid, oid, roleIds, pageNumber, pageSize) => {
  const result = await userServiceRoles.findAndCountAll({
    where: {
      organisation_id: {
        [Op.eq]: oid,
      },
      service_id: {
        [Op.eq]: sid,
      },
      role_id: {
        [Op.in]: roleIds,
      },
    },
    include: ['role'],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  });

  const services = await mapUserServiceRoles(result.rows);
  const { count } = result;
  return {
    services,
    page: pageNumber,
    totalNumberOfPages: Math.ceil(count / pageSize),
    totalNumberOfRecords: count,
  };
};

const getPageOfUserServices = async (pageNumber, pageSize) => {
  const queryOpts = {
    type: QueryTypes.SELECT,
  };
  const skip = (pageNumber - 1) * pageSize;
  const { count } = (await connection.query('SELECT COUNT(1) count FROM user_services', queryOpts))[0];
  const rows = await connection.query('SELECT\n'
    + '       page.id user_service_id,\n'
    + '       page.user_id,\n'
    + '       page.service_id,\n'
    + '       page.organisation_id,\n'
    + '       page.CreatedAt,\n'
    + '       role.Id role_id,\n'
    + '       role.Name role_name,\n'
    + '       role.ApplicationId role_application_id,\n'
    + '       role.Status role_status,\n'
    + '       role.Code role_code,\n'
    + '       role.ParentId role_parent_id,\n'
    + '       role.NumericId role_numeric_id,\n'
    + '       usi.identifier_key,\n'
    + '       usi.identifier_value\n'
    + 'FROM (SELECT *\n'
    + '      FROM user_services\n'
    + '      ORDER BY user_id, service_id, organisation_id\n'
    + `      OFFSET ${skip} ROWS FETCH NEXT ${pageSize} ROWS ONLY) page\n`
    + 'LEFT JOIN user_service_roles usr\n'
    + '    ON page.user_id = usr.user_id\n'
    + '    AND page.service_id = usr.service_id\n'
    + '    AND page.organisation_id = usr.organisation_id\n'
    + 'LEFT JOIN Role\n'
    + '    ON usr.role_id = role.id\n'
    + 'LEFT JOIN user_service_identifiers usi\n'
    + '    ON page.user_id = usi.user_id\n'
    + '    AND page.service_id = usi.service_id\n'
    + '    AND page.organisation_id = usi.organisation_id\n'
    + 'ORDER BY page.user_id, page.service_id, page.organisation_id, role.name, usi.identifier_key', queryOpts);
  const entities = [];
  let currentEntity;
  for (let i = 0; i < rows.length; i += 1) {
    const currentRow = rows[i];
    if (!currentEntity || currentRow.user_service_id !== currentEntity.id) {
      currentEntity = {
        id: currentRow.user_service_id,
        user_id: currentRow.user_id,
        service_id: currentRow.service_id,
        organisation_id: currentRow.organisation_id,
        createdAt: currentRow.CreatedAt,
        identifiers: [],
        roles: [],
      };
      entities.push(currentEntity);
    }

    if (currentRow.identifier_key && !currentEntity.identifiers.find((x) => x.identifier_key === currentRow.identifier_key)) {
      currentEntity.identifiers.push({
        identifier_key: currentRow.identifier_key,
        identifier_value: currentRow.identifier_value,
      });
    }

    if (currentRow.role_id && !currentEntity.roles.find((x) => x.id === currentRow.role_id)) {
      currentEntity.roles.push({
        role: {
          id: currentRow.role_id,
          name: currentRow.role_name,
          applicationId: currentRow.role_application_id,
          status: currentRow.role_status,
          code: currentRow.role_code,
          parentId: currentRow.role_parent_id,
          numericId: currentRow.role_numeric_id,
        },
      });
    }
  }
  const services = await mapUserServiceEntities(entities);

  return {
    services,
    numberOfPages: Math.ceil(count / pageSize),
  };
};

const addUserServiceRole = async (uid, sid, oid, rid) => {
  await userServiceRoles.create({
    id: uuid.v4(),
    user_id: uid,
    organisation_id: oid,
    service_id: sid,
    role_id: rid,
  });
};

const addInvitationService = async (iid, sid, oid) => {
  const existing = await invitationServices.findOne({
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
    const id = uuid.v4();
    await invitationServices.create({
      id,
      invitation_id: iid,
      organisation_id: oid,
      service_id: sid,
    });
    return id;
  }
  return existing.id;
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

const removeAllInvitationServiceIdentifiers = async (iid, sid, oid, t = undefined) => {
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
  },
  { transaction: t });
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
  const entities = await invitationServices.findOne({
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

const removeAllInvitationServiceRoles = async (uid, sid, oid) => {
  await invitationServiceRoles.destroy({
    where: {
      invitation_id: {
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

const addInvitationServiceRole = async (uid, sid, oid, rid) => {
  await invitationServiceRoles.create({
    id: uuid.v4(),
    invitation_id: uid,
    organisation_id: oid,
    service_id: sid,
    role_id: rid,
  });
};

const getPoliciesForService = async (sid) => {
  const entities = await policies.findAll({
    where: {
      applicationId: {
        [Op.eq]: sid,
      },
    },
    include: ['conditions', 'roles'],
    order: ['name'],
  });
  return await mapPolicyEntities(entities);
};

const getPageOfPolicies = async (sid, pageNumber, pageSize) => {
  const offset = (pageNumber - 1) * pageSize;
  const entities = await policies.findAndCountAll({
    where: {
      applicationId: {
        [Op.eq]: sid,
      },
    },
    distinct: true,
    include: ['conditions', 'roles'],
    order: ['name'],
    limit: pageSize,
    offset,
  });
  return {
    policies: await mapPolicyEntities(entities.rows),
    page: pageNumber,
    totalNumberOfPages: Math.ceil(entities.count / pageSize),
    totalNumberOfRecords: entities.count,
  };
};

const getPolicy = async (id) => {
  const entity = await policies.findOne({
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
        [Op.eq]: sid,
      },
    },
    include: ['parent'],
    order: ['name'],
  });
  if (!entities || entities.length === 0) {
    return [];
  }
  return await mapRoleEntities(entities);
};

module.exports = {
  // User services
  getUserServices,
  getUserService,
  getUsersOfServicePaged,
  getPageOfUserServices,
  getUserOfServiceIdentifier,
  getUsersOfServicePagedV2,
  addUserService,
  addUserServiceIdentifier,
  addUserServiceRole,
  removeUserServiceAndAssociations,
  removeAllUserServiceIdentifiers,
  removeAllUserServiceRequests,
  removeAllUserServiceRoles,
  removeUserService,
  removeAllUserServiceGroupIdentifiers,
  addGroupsToUserServiceIdentifier,

  // Invitation services
  getInvitationServices,
  getPageOfInvitationServices,
  addInvitationService,
  addInvitationServiceIdentifier,
  addInvitationServiceRole,
  getInvitationService,
  removeInvitationService,
  removeAllInvitationServiceIdentifiers,
  removeAllInvitationServiceRoles,

  // Policies
  getPoliciesForService,
  getPolicy,
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
  deletePolicy,
  deletePolicyConditions,
  deletePolicyRoles,
  getPageOfPolicies,

  // Service roles
  getServiceRoles,
};
