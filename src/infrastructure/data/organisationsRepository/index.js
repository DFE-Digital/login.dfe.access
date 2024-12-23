const config = require("./../../config");

const { makeConnection } = require("./connection");
const userServices = require("./userServices");
const userServiceIdentifiers = require("./userServiceIdentifiers");
const invitationServices = require("./invitationServices");
const invitationServiceIdentifiers = require("./invitationServiceIdentifiers");
const policies = require("./policy");
const roles = require("./role");
const policyRoles = require("./policyRole");
const policyConditions = require("./policyCondition");
const userServiceRoles = require("./userServiceRoles");
const invitationServiceRoles = require("./invitationServiceRoles");
const userServiceRequests = require("./userServiceRequest");
const organisations = require("./organisation");

const db = makeConnection();

const buildDataModel = (model, connection, entityModels) => {
  const dbSchema = config.database.schema || "services";

  // Define
  entityModels.forEach((entityModel) => {
    model[entityModel.name] = entityModel.define(db, dbSchema);
  });

  // Extend
  entityModels
    .filter((m) => m.extend !== undefined)
    .forEach((entityModel) => {
      entityModel.extend(model);
    });
};
const dataModel = {};
buildDataModel(dataModel, db, [
  userServices,
  userServiceIdentifiers,
  invitationServices,
  invitationServiceIdentifiers,
  policies,
  roles,
  policyRoles,
  policyConditions,
  userServiceRoles,
  invitationServiceRoles,
  userServiceRequests,
  organisations,
]);
dataModel.connection = db;

module.exports = dataModel;
