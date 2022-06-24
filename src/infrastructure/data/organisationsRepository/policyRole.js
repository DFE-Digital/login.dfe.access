const Sequelize = require('sequelize');

const define = (db, schema) => {
  return db.define('policyRole', {
    policyId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    roleId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'policyRole',
    schema,
  });
};

const extend = () => {
};

module.exports = {
  name: 'policyRoles',
  define,
  extend,
};