'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');

const router = express.Router();

const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));

  return router;
};

module.exports = buildArea;