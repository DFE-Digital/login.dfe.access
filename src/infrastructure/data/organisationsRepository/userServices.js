const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const define = (db, schema) => {
  return db.define(
    "user_services",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.SMALLINT,
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
      lastAccess: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "user_services",
      schema,
    },
  );
};

const extend = ({ userServices, userServiceIdentifiers, userServiceRoles }) => {
  userServices.prototype.getIdentifiers = async function () {
    return userServiceIdentifiers.findAll({
      where: {
        user_id: {
          [Op.eq]: this.user_id,
        },
        organisation_id: {
          [Op.eq]: this.organisation_id,
        },
        service_id: {
          [Op.eq]: this.service_id,
        },
      },
    });
  };

  userServices.prototype.getRoles = async function () {
    return userServiceRoles.findAll({
      where: {
        user_id: {
          [Op.eq]: this.user_id,
        },
        organisation_id: {
          [Op.eq]: this.organisation_id,
        },
        service_id: {
          [Op.eq]: this.service_id,
        },
      },
      include: ["role"],
    });
  };
};

module.exports = {
  name: "userServices",
  define,
  extend,
};
