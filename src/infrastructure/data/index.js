const { userServices } = require('./organisationsRepository');
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

module.exports = {
  getUserServices,
  addUserService,
};
