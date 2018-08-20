'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUserServices = require('./listUserServices');
const addServiceToUser = require('./addServiceToUser');
const removeServiceFromUser = require('./removeServiceFromUser');

const router = express.Router();

const buildArea = () => {
  router.get('/:uid/services', asyncWrapper(listUserServices));
  router.put('/:uid/services/:sid/organisations/:oid', asyncWrapper(addServiceToUser)); // Duplicate for /:uid/services/:sid when org becomes optional
  router.delete('/:uid/services/:sid/organisations/:oid', asyncWrapper(removeServiceFromUser)); // Duplicate for /:uid/services/:sid when org becomes optional

  return router;
};

module.exports = buildArea;