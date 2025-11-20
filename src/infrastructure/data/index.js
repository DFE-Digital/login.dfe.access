const Sequelize = require("sequelize");
const { Op, QueryTypes } = require("sequelize");
const uuid = require("uuid");

const {
  connection,
  userServices,
  userServiceIdentifiers,
  userServiceRequests,
  invitationServices,
  invitationServiceIdentifiers,
  policies,
  policyConditions,
  policyRoles,
  roles,
  userServiceRoles,
  invitationServiceRoles,
} = require("./organisationsRepository");
const {
  mapUserServiceEntities,
  mapUserServiceEntity,
  mapPolicyEntities,
  mapPolicyEntity,
  mapRoleEntities,
  mapUserServiceRoles,
  mapUserServiceRequests,
} = require("./mappers");

const getServiceRoleById = async (sid, rid) => {
  const serviceRole = await roles.findOne({
    where: {
      applicationId: {
        [Op.eq]: sid,
      },
      id: {
        [Op.eq]: rid,
      },
    },
  });
  return serviceRole;
};

const getServiceRoleByCode = async (sid, roleCode) => {
  const serviceRole = await roles.findOne({
    where: {
      applicationId: {
        [Op.eq]: sid,
      },
      code: {
        [Op.eq]: roleCode,
      },
    },
  });
  return serviceRole;
};

const createServiceRole = async (sid, roleName, roleCode) => {
  const roleExists = await getServiceRoleByCode(sid, roleCode);
  if (!roleExists) {
    const id = uuid.v4();
    const newRole = await roles.create({
      id,
      name: roleName,
      applicationId: sid,
      status: 1,
      code: roleCode,
      numericId: Sequelize.literal("NEXT VALUE FOR role_numeric_id_sequence"),
    });
    return {
      role: newRole.dataValues,
      statusCode: 201,
    };
  }
  return {
    role: roleExists.dataValues,
    statusCode: 409,
  };
};

const deleteUserServiceRolesByRoleId = async (rid) => {
  await userServiceRoles.destroy({
    where: {
      role_id: {
        [Op.eq]: rid,
      },
    },
  });
};

const deleteInvitationServiceRolesByRoleId = async (rid) => {
  await invitationServiceRoles.destroy({
    where: {
      role_id: {
        [Op.eq]: rid,
      },
    },
  });
};

const userServicesCleanUp = async (sid) => {
  // Remove user_services records when user no longer has any roles
  const leftoverUserServiceIds = await connection.query(
    `SELECT us.id 
     FROM user_services us 
     WHERE us.service_id = :sid 
     AND NOT EXISTS (
       SELECT 1 FROM user_service_roles usr
       WHERE usr.user_id = us.user_id
       AND usr.organisation_id = us.organisation_id
       AND usr.service_id = us.service_id
       AND usr.service_id = :sid
     )`,
    {
      type: QueryTypes.SELECT,
      replacements: { sid },
    },
  );

  if (leftoverUserServiceIds.length > 0) {
    const idsToDelete = leftoverUserServiceIds.map((row) => row.id);
    await userServices.destroy({
      where: {
        id: {
          [Op.in]: idsToDelete,
        },
      },
    });
  }
};

const invitationServicesCleanUp = async (sid) => {
  // Remove invitation_services records when invitation no longer has any roles
  const leftoverInvitationServiceIds = await connection.query(
    `SELECT ins.id 
     FROM invitation_services ins 
     WHERE ins.service_id = :sid 
     AND NOT EXISTS (
       SELECT 1 FROM invitation_service_roles isr
       WHERE isr.invitation_id = ins.invitation_id
       AND isr.organisation_id = ins.organisation_id
       AND isr.service_id = ins.service_id
       AND isr.service_id = :sid
     )`,
    {
      type: QueryTypes.SELECT,
      replacements: { sid },
    },
  );

  if (leftoverInvitationServiceIds.length > 0) {
    const idsToDelete = leftoverInvitationServiceIds.map((row) => row.id);
    await invitationServices.destroy({
      where: {
        id: {
          [Op.in]: idsToDelete,
        },
      },
    });
  }
};

const deleteServiceRole = async (sid, rid) => {
  await deleteUserServiceRolesByRoleId(rid);
  await userServicesCleanUp(sid);
  await deleteInvitationServiceRolesByRoleId(rid);
  await invitationServicesCleanUp(sid);

  await roles.destroy({
    where: {
      id: {
        [Op.eq]: rid,
      },
    },
  });
};

const getUserServices = async (uid) => {
  const entities = await userServices.findAll({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
    },
    order: ["service_id", "organisation_id"],
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

const updateUserServiceLastAccess = async (uid, sid, oid) => {
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
  if (existing) {
    await existing.update({
      lastAccessed: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  }
  return existing?.id;
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
        [Op.eq]: "groups",
      },
    },
  });
};

const addGroupsToUserServiceIdentifier = async (uid, sid, oid, value) => {
  await userServiceIdentifiers.upsert({
    user_id: uid,
    organisation_id: oid,
    service_id: sid,
    identifier_key: "groups",
    identifier_value: value,
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

// TODO: update model to support sequelize relationships
const getUsersOfServicePaged = async (
  sid,
  oid,
  userIds,
  filters,
  pageNumber,
  pageSize,
) => {
  let queryFrom = "FROM [dbo].[user_services] AS [user_services]";
  let queryWhere = "WHERE [user_services].[service_id] = :sid";
  const queryOpts = {
    type: QueryTypes.SELECT,
    replacements: { sid },
  };

  if (oid) {
    queryOpts.replacements.oid = oid;
    queryWhere += " AND [user_services].[organisation_id] = :oid";
  }

  if (userIds) {
    queryOpts.replacements.userIds = userIds;
    queryWhere += " AND [user_services].[user_id] IN(:userIds)";
  }

  if (filters) {
    let needsIdentifiersJoin = false;

    if (filters.idkey) {
      queryWhere += " AND [user_service_identifiers].[identifier_key] = :idkey";
      queryOpts.replacements.idkey = filters.idkey;
      needsIdentifiersJoin = true;
    }

    if (filters.idvalue) {
      queryWhere +=
        " AND [user_service_identifiers].[identifier_value] = :idvalue";
      queryOpts.replacements.idvalue = filters.idvalue;
      needsIdentifiersJoin = true;
    }

    if (needsIdentifiersJoin) {
      queryFrom +=
        " INNER JOIN [user_service_identifiers] AS [user_service_identifiers] " +
        "ON [user_services].[user_id] = [user_service_identifiers].[user_id] " +
        "AND [user_services].[organisation_id] = [user_service_identifiers].[organisation_id] " +
        "AND [user_services].[service_id] = [user_service_identifiers].[service_id] ";
    }
  }

  const { count } = (
    await connection.query(
      `SELECT COUNT(DISTINCT [id]) AS [count] ${queryFrom} ${queryWhere};`,
      queryOpts,
    )
  )[0];
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

const getUsersOfServicePagedV2 = async (
  sid,
  oid,
  roleIds,
  pageNumber,
  pageSize,
) => {
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
    include: ["role"],
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
  const { count } = (
    await connection.query(
      "SELECT COUNT(1) count FROM user_services",
      queryOpts,
    )
  )[0];
  const rows = await connection.query(
    "SELECT\n" +
      "       page.id user_service_id,\n" +
      "       page.user_id,\n" +
      "       page.service_id,\n" +
      "       page.organisation_id,\n" +
      "       page.CreatedAt,\n" +
      "       role.Id role_id,\n" +
      "       role.Name role_name,\n" +
      "       role.ApplicationId role_application_id,\n" +
      "       role.Status role_status,\n" +
      "       role.Code role_code,\n" +
      "       role.ParentId role_parent_id,\n" +
      "       role.NumericId role_numeric_id,\n" +
      "       usi.identifier_key,\n" +
      "       usi.identifier_value\n" +
      "FROM (SELECT *\n" +
      "      FROM user_services\n" +
      "      ORDER BY user_id, service_id, organisation_id\n" +
      `      OFFSET ${skip} ROWS FETCH NEXT ${pageSize} ROWS ONLY) page\n` +
      "LEFT JOIN user_service_roles usr\n" +
      "    ON page.user_id = usr.user_id\n" +
      "    AND page.service_id = usr.service_id\n" +
      "    AND page.organisation_id = usr.organisation_id\n" +
      "LEFT JOIN Role\n" +
      "    ON usr.role_id = role.id\n" +
      "LEFT JOIN user_service_identifiers usi\n" +
      "    ON page.user_id = usi.user_id\n" +
      "    AND page.service_id = usi.service_id\n" +
      "    AND page.organisation_id = usi.organisation_id\n" +
      "ORDER BY page.user_id, page.service_id, page.organisation_id, role.name, usi.identifier_key",
    queryOpts,
  );
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

    if (
      currentRow.identifier_key &&
      !currentEntity.identifiers.find(
        (x) => x.identifier_key === currentRow.identifier_key,
      )
    ) {
      currentEntity.identifiers.push({
        identifier_key: currentRow.identifier_key,
        identifier_value: currentRow.identifier_value,
      });
    }

    if (
      currentRow.role_id &&
      !currentEntity.roles.find((x) => x.id === currentRow.role_id)
    ) {
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

const removeAllUserServiceRoles = async (uid, sid, oid) => {
  await userServiceRoles.destroy({
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
    order: ["service_id", "organisation_id"],
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
    order: ["invitation_id", "service_id", "organisation_id"],
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
    include: ["conditions", "roles"],
    order: ["name"],
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
    include: ["conditions", "roles"],
    order: ["name"],
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
    include: ["conditions", "roles"],
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
    include: ["parent"],
    order: ["name"],
  });
  if (!entities || entities.length === 0) {
    return [];
  }
  return await mapRoleEntities(entities);
};

/**
 * Gets a role.
 *
 * @param {string} id Id of the role that is being searched for
 * @returns The database entity representing the role
 */
const getRole = async (id) => {
  const entity = await roles.findOne({
    where: {
      Id: {
        [Op.eq]: id,
      },
    },
    include: ["parent"],
  });
  return entity;
};

/**
 * Updates a role.  `role` can only contain the following keys
 * ('name', 'code').
 *
 * @param {Model} existingRole A database entity representing an existing role
 * @param {Object} role An object containing new values.
 */

const updateRoleEntity = async (existingRole, role) => {
  const updatedRole = Object.assign(existingRole, role);
  await existingRole.update({
    name: updatedRole.name,
    code: updatedRole.code,
  });
};

/**
 * Updates a role.  `roleDataToUpdate` can only contain the following keys
 * ('name', 'code').
 *
 * @param {String} id The id of the role that will be updated
 * @param {Object} roleDataToUpdate An object containing new values.
 */

const updateRole = async (id, roleDataToUpdate) => {
  await roles.update(roleDataToUpdate, {
    where: {
      id,
    },
  });
};

const getUserServiceRequestEntity = async (id) => {
  const entity = await userServiceRequests.findOne({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  });
  return entity;
};

const getUserServiceRequests = async (uid) => {
  const entities = await userServiceRequests.findAll({
    where: {
      user_id: {
        [Op.eq]: uid,
      },
    },
    order: ["service_id", "organisation_id"],
  });
  return mapUserServiceRequests(entities);
};

/**
 * Updates a user service request.  The requestBody can only contain the following keys
 * ('status', 'actioned_by', 'actioned_reason', 'actioned_at').
 *
 * @param {Model} existingRequest A database entity representing an existing service request
 * (e.g., the output from getUserServiceRequestEntity)
 * @param {*} request A dictionary containing new values.
 */

const updateUserServiceRequest = async (existingRequest, request) => {
  const updatedRequest = Object.assign(existingRequest, request);
  await existingRequest.update({
    status: updatedRequest.status,
    actioned_by: updatedRequest.actioned_by,
    actioned_reason: updatedRequest.actioned_reason,
    actioned_at: updatedRequest.actioned_at,
  });
};

module.exports = {
  getServiceRoleById,
  getServiceRoleByCode,
  createServiceRole,
  deleteUserServiceRolesByRoleId,
  deleteInvitationServiceRolesByRoleId,
  userServicesCleanUp,
  invitationServicesCleanUp,
  deleteServiceRole,
  getUserServices,
  getUserService,
  addUserService,
  updateUserServiceLastAccess,
  addUserServiceIdentifier,
  getUserOfServiceIdentifier,
  removeAllUserServiceIdentifiers,
  removeUserService,
  getUsersOfServicePaged,
  getPageOfUserServices,
  removeAllUserServiceRoles,
  addUserServiceRole,

  getUserServiceRequestEntity,
  getUserServiceRequests,
  updateUserServiceRequest,

  addInvitationService,
  addInvitationServiceIdentifier,
  removeAllInvitationServiceIdentifiers,
  getInvitationServices,
  getPageOfInvitationServices,
  removeAllInvitationServiceRoles,
  addInvitationServiceRole,

  getPoliciesForService,
  getPolicy,
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
  deletePolicy,
  deletePolicyConditions,
  deletePolicyRoles,
  getServiceRoles,
  getRole,
  updateRole,
  updateRoleEntity,
  getInvitationService,
  removeInvitationService,
  getUsersOfServicePagedV2,
  removeAllUserServiceGroupIdentifiers,
  addGroupsToUserServiceIdentifier,
  getPageOfPolicies,
};
