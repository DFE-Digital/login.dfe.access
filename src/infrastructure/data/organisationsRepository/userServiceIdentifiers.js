const Sequelize = require('sequelize');

const define = (db, schema) => {
  const model = db.define('user_service_identifiers', {
    user_id: {
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