"use strict";

const express = require("express");
const { asyncWrapper } = require("login.dfe.express-error-handling");

const listAllInvitationsServices = require("./listAllInvitationsServices");
const listInvitationServices = require("./listInvitationServices");
const addServiceToInvitation = require("./addServiceToInvitation");
const migrateInvitationToUser = require("./migrateInvitationToUser");
const getSingleInvitationService = require("./getSingleInvitationService");
const removeServiceFromInvitation = require("./removeServiceFromInvitation");
const updateInvitationService = require("./updateInvitationService");
const router = express.Router();

const buildArea = () => {
  router.get("/", asyncWrapper(listAllInvitationsServices));
  router.get("/:iid/services", asyncWrapper(listInvitationServices));
  router.get(
    "/:iid/services/:sid/organisations/:oid",
    asyncWrapper(getSingleInvitationService),
  );
  router.put(
    "/:iid/services/:sid/organisations/:oid",
    asyncWrapper(addServiceToInvitation),
  ); // Duplicate for /:iid/services/:sid when org becomes optional
  router.patch(
    "/:iid/services/:sid/organisations/:oid",
    asyncWrapper(updateInvitationService),
  ); // Duplicate for /:iid/services/:sid when org becomes optional
  router.post("/:iid/migrate-to-user", asyncWrapper(migrateInvitationToUser));
  router.delete(
    "/:iid/services/:sid/organisations/:oid",
    asyncWrapper(removeServiceFromInvitation),
  );

  return router;
};

module.exports = buildArea;
