const { connection, userServices, userServiceIdentifiers } = require('./organisationsRepository');
const { Op, QueryTypes } = require('sequelize');
const { mapUserServiceEntities, mapUserServiceEntity } = require('./mappers');
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

module.exports = {
  getUserServices,
  getUserService,
  addUserService,
  addUserServiceIdentifier,
  removeAllUserServiceIdentifiers,
  removeUserService,
  getUsersOfServicePaged,
};
