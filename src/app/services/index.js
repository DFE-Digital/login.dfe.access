'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');
const listUsersOfServiceAtOrganisation = require('./listUsersOfServiceAtOrganisation');
const listRolesOfService = require('./listRolesOfService');
const listPoliciesOfService = require('./listPoliciesOfService');
const createPolicyOfService = require('./createPolicyOfService');
const getPolicyOfService = require('./getPolicyOfService');
const updatePolicyOfService = require('./updatePolicyOfService');
const deletePolicyOfService = require('./deletePolicyOfService');

const router = express.Router();

const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));
  router.get('/:sid/organisations/:oid/users', asyncWrapper(listUsersOfServiceAtOrganisation));

  router.get('/:sid/roles', asyncWrapper(listRolesOfService));

  router.get('/:sid/policies', asyncWrapper(listPoliciesOfService));
  router.post('/:sid/policies', asyncWrapper(createPolicyOfService));
  router.get('/:sid/policies/:pid', asyncWrapper(getPolicyOfService));
  router.patch('/:sid/policies/:pid', asyncWrapper(updatePolicyOfService));
  router.delete('/:sid/policies/:pid', asyncWrapper(deletePolicyOfService));

  return router;
};

module.exports = buildArea;