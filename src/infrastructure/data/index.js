
const { userServices } = require('./organisationsRepository');
const { Op } = require('sequelize');
const {  mapUserServiceEntities } = require('./mappers');


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

module.exports = {
  getUserServices,
};
