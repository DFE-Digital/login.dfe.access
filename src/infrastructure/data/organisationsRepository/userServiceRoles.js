const { default: Sequelize, Op } = require('sequelize').default;

const define = (db, schema) => {
  return db.define('user_service_roles', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    organisation_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    role_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'user_service_roles',
    schema,
  });
};

const extend = () => {
};

module.exports = {
  name: 'userServiceRoles',
  define,
  extend,
};