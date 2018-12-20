const SimpleSchema = require('simpl-schema').default;
const { validateConfigAgainstSchema, schemas, patterns } = require('login.dfe.config.schema.common');
const config = require('./index');
const logger = require('./../logger');

const notificationsSchema = new SimpleSchema({
  connectionString: patterns.redis,
});

const schema = new SimpleSchema({
  loggerSettings: schemas.loggerSettings,
  hostingEnvironment: schemas.hostingEnvironment,
  database: schemas.sequelizeConnection,
  notifications: notificationsSchema,
});

module.exports.validate = () => {
  validateConfigAgainstSchema(config, schema, logger)
};