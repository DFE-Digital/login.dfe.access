const SimpleSchema = require('simpl-schema').default;
const { validateConfigAgainstSchema, schemas, patterns } = require('login.dfe.config.schema.common');
const config = require('./index');
const logger = require('./../logger');

const notificationsSchema = new SimpleSchema({
  connectionString: patterns.redis,
});

const togglesSchema = new SimpleSchema({
  notificationsEnabled: Boolean,
});

const schema = new SimpleSchema({
  loggerSettings: schemas.loggerSettings,
  hostingEnvironment: schemas.hostingEnvironment,
  auth: schemas.apiServerAuth,
  database: schemas.sequelizeConnection,
  notifications: notificationsSchema,
  toggles: togglesSchema,
});

module.exports.validate = () => {
  validateConfigAgainstSchema(config, schema, logger)
};
