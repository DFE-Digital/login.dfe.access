const Sequelize = require("sequelize").default;
const { UUID, STRING, DATE, SMALLINT } = Sequelize;

const define = (db, schema) => {
  return db.define(
    "user_service_requests",
    {
      id: {
        type: UUID,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: UUID,
        allowNull: false,
      },
      service_id: {
        type: UUID,
        allowNull: false,
      },
      role_ids: {
        type: STRING,
        allowNull: true,
      },
      organisation_id: {
        type: UUID,
        allowNull: false,
      },
      status: {
        type: SMALLINT,
        allowNull: false,
        defaultValue: 0,
      },
      reason: {
        type: STRING,
        allowNull: true,
      },
      actioned_by: {
        type: UUID,
        allowNull: true,
      },
      actioned_reason: {
        type: STRING,
        allowNull: true,
      },
      actioned_at: {
        type: DATE,
        allowNull: true,
      },
      request_type: {
        type: STRING,
        allowNull: false,
        defaultValue: "service",
      },
    },
    {
      timestamps: true,
      tableName: "user_service_requests",
      schema,
    },
  );
};

const extend = ({ userServiceRequests, organisations }) => {
  userServiceRequests.belongsTo(organisations, {
    as: "organisation",
    foreignKey: "organisation_id",
  });
};

module.exports = {
  name: "userServiceRequests",
  define,
  extend,
};
