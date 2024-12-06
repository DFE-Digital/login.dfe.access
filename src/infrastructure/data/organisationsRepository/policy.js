const Sequelize = require("sequelize");

const define = (db, schema) => {
  return db.define(
    "policy",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
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
    },
    {
      timestamps: true,
      tableName: "policy",
      schema,
    },
  );
};

const extend = ({ policies, roles, policyConditions }) => {
  policies.hasMany(policyConditions, {
    foreignKey: "policyId",
    sourceKey: "id",
    as: "conditions",
  });
  policies.belongsToMany(roles, { through: "policyRole", as: "roles" });
};

module.exports = {
  name: "policies",
  define,
  extend,
};
