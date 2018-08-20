'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUserServices = require('./listUserServices');
const addServiceToUser = require('./addServiceToUser');
const removeServiceFromUser = require('./removeServiceFromUser');

const router = express.Router();

const buildArea = () => {
  router.get('/:uid/services', asyncWrapper(listUserServices));
  router.put('/:uid/services/:sid', asyncWrapper(addServiceToUser));
  router.delete('/:uid/services/:sid', asyncWrapper(removeServiceFromUser));

  return router;
};

module.exports = buildArea;