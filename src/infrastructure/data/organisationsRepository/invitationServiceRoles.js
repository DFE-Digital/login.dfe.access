const Sequelize = require("sequelize");

const define = (db, schema) => {
  return db.define(
    "invitation_service_roles",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      invitation_id: {
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
      tableName: "invitation_service_roles",
      schema,
    },
  );
};

const extend = ({ invitationServiceRoles, roles }) => {
  invitationServiceRoles.belongsTo(roles, {
    as: "role",
    foreignKey: "role_id",
  });
};

module.exports = {
  name: "invitationServiceRoles",
  define,
  extend,
};
