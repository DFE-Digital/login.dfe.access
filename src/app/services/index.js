'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');
const listPoliciesOfService = require('./listPoliciesOfService');

const router = express.Router();

const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));
  router.get('/:sid/policies', asyncWrapper(listPoliciesOfService));

  return router;
};

module.exports = buildArea;