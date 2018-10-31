'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listInvitationServices = require('./listInvitationServices');
const addServiceToInvitation = require('./addServiceToInvitation');
const migrateInvitationToUser = require('./migrateInvitationToUser');

const router = express.Router();

const buildArea = () => {
  router.get('/:iid/services', asyncWrapper(listInvitationServices));
  router.put('/:iid/services/:sid/organisations/:oid', asyncWrapper(addServiceToInvitation)); // Duplicate for /:iid/services/:sid when org becomes optional
  router.post('/:iid/migrate-to-user', asyncWrapper(migrateInvitationToUser));

  return router;
};

module.exports = buildArea;