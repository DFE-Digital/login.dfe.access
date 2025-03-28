const Sequelize = require("sequelize");

const define = (db, schema) => {
  return db.define(
    "policyCondition",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      policyId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      field: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      operator: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "policyCondition",
      schema,
    },
  );
};

const extend = () => {};

module.exports = {
  name: "policyConditions",
  define,
  extend,
};
