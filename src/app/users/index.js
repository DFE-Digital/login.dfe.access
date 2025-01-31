'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listAllUsersServices = require('./listAllUsersServices');
const listUserServices = require('./listUserServices');
const listUserServiceRequests = require('./listUserServiceRequests');
const getSingleUserService = require('./getSingleUserService');
const addServiceToUser = require('./addServiceToUser');
const updateUserService = require('./updateUserService');
const setUserServiceLastAccess = require('./updateLastAccess');
const removeServiceFromUser = require('./removeServiceFromUser');
const addServiceIdentifierToUser = require('./addServiceIdentifierToUser');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper(listAllUsersServices));
  router.get('/:uid/services', asyncWrapper(listUserServices));
  router.get('/:uid/service-requests', asyncWrapper(listUserServiceRequests));
  router.get('/:uid/services/:sid/organisations/:oid', asyncWrapper(getSingleUserService)); // Duplicate for /:uid/services/:sid when org becomes optional
  router.put('/:uid/services/:sid/organisations/:oid', asyncWrapper(addServiceToUser)); // Duplicate for /:uid/services/:sid when org becomes optional
  router.patch('/:uid/services/:sid/organisations/:oid/updateLastAccess', asyncWrapper(updateLastAccess));
  router.patch('/:uid/services/:sid/organisations/:oid', asyncWrapper(updateUserService)); // Duplicate for /:uid/services/:sid when org becomes optional
  router.delete('/:uid/services/:sid/organisations/:oid', asyncWrapper(removeServiceFromUser)); // Duplicate for /:uid/services/:sid when org becomes optional
  router.put('/:uid/services/:sid/organisations/:oid/identifiers/:idkey', asyncWrapper(addServiceIdentifierToUser)); // Duplicate for /:uid/services/:sid/identifiers when org becomes optional

  return router;
};

module.exports = buildArea;
