'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');
const listPoliciesOfService = require('./listPoliciesOfService');
const createPolicyOfService = require('./createPolicyOfService');
const getPolicyOfService = require('./getPolicyOfService');
const updatePolicyOfService = require('./updatePolicyOfService');

const router = express.Router();

const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));
  router.get('/:sid/policies', asyncWrapper(listPoliciesOfService));
  router.post('/:sid/policies', asyncWrapper(createPolicyOfService));
  router.get('/:sid/policies/:pid', asyncWrapper(getPolicyOfService));
  router.patch('/:sid/policies/:pid', asyncWrapper(updatePolicyOfService));
  // router.delete('/:sid/policies/:pid', asyncWrapper(upsertPolicyOfService));

  return router;
};

module.exports = buildArea;