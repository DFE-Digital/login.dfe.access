const Sequelize = require("sequelize");

const define = (db, schema) => {
  return db.define(
    "user_service_roles",
    {
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
    },
    {
      timestamps: true,
      tableName: "user_service_roles",
      schema,
    },
  );
};

const extend = ({ userServiceRoles, roles }) => {
  userServiceRoles.belongsTo(roles, { as: "role", foreignKey: "role_id" });
};

module.exports = {
  name: "userServiceRoles",
  define,
  extend,
};
