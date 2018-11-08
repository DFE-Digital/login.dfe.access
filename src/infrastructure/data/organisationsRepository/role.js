const { default: Sequelize, Op } = require('sequelize').default;

const define = (db, schema) => {
  return db.define('role', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    applicationId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    status: {
      type: Sequelize.SMALLINT,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'role',
    schema,
  });
};

const extend = () => {
};

module.exports = {
  name: 'roles',
  define,
  extend,
};