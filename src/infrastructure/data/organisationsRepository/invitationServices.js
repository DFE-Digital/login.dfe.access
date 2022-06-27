const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define('invitation_services', {
    invitation_id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    organisation_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'invitation_services',
    schema,
  });
  model.removeAttribute('id');
  return model;
};

const extend = ({ invitationServices, invitationServiceIdentifiers, invitationServiceRoles }) => {
  invitationServices.prototype.getIdentifiers = async function () {
    return invitationServiceIdentifiers.findAll({
      where: {
        invitation_id: {
          [Op.eq]: this.invitation_id,
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
  invitationServices.prototype.getRoles = async function () {
    return invitationServiceRoles.findAll({
      where: {
        invitation_id: {
          [Op.eq]: this.invitation_id,
        },
        organisation_id: {
          [Op.eq]: this.organisation_id,
        },
        service_id: {
          [Op.eq]: this.service_id,
        },
      },
      include: ['role'],
    });
  };
};

module.exports = {
  name: 'invitationServices',
  define,
  extend,
};
