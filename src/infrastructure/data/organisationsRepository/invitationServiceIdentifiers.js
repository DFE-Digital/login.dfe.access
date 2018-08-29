const Sequelize = require('sequelize').default;

const define = (db, schema) => {
  const model = db.define('invitation_service_identifiers', {
    invitation_id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    organisation_id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    identifier_key: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    identifier_value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'invitation_service_identifiers',
    schema,
  });
  model.removeAttribute('id');
  return model;
};

const extend = () => {
};

module.exports = {
  name: 'invitationServiceIdentifiers',
  define,
  extend,
};