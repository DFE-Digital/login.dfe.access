'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');
const listPoliciesOfService = require('./listPoliciesOfService');
const createPolicyOfService = require('./createPolicyOfService');

const router = express.Router();

const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));
  router.get('/:sid/policies', asyncWrapper(listPoliciesOfService));
  router.post('/:sid/policies', asyncWrapper(createPolicyOfService));
  // router.get('/:sid/policies/:pid', asyncWrapper(upsertPolicyOfService));
  // router.put('/:sid/policies/:pid', asyncWrapper(upsertPolicyOfService));
  // router.delete('/:sid/policies/:pid', asyncWrapper(upsertPolicyOfService));

  return router;
};

module.exports = buildArea;