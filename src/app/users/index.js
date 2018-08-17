'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUserServices = require('./listUserServices');

const router = express.Router();

const buildArea = () => {
  router.get('/:uid/services', asyncWrapper(listUserServices));
  // router.put('/:uid/services/:sid', asyncWrapper(stubAction));
  // router.delete('/:uid/services/:sid', asyncWrapper(stubAction));

  return router;
};

module.exports = buildArea;