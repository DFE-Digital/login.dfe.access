const Sequelize = require('sequelize').default;

const define = (db, schema) => {
  const model = db.define('user_service_identifiers', {
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
    identifier_key: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identifier_value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'user_service_identifiers',
    schema,
  });
  model.removeAttribute('id');
  return model;
};

const extend = () => {
};

module.exports = {
  name: 'userServiceIdentifiers',
  define,
  extend,
};