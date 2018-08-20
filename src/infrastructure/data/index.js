const { userServices, userServiceIdentifiers } = require('./organisationsRepository');
const { Op } = require('sequelize');
const { mapUserServiceEntities } = require('./mappers');
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

module.exports = {
  getUserServices,
  addUserService,
  addUserServiceIdentifier,
  removeAllUserServiceIdentifiers,
  removeUserService,
};
