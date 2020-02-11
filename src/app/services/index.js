'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const listUsersOfService = require('./listUsersOfService');
const listUsersOfServiceAtOrganisation  = require('./listUsersOfServiceAtOrganisation');
const listUsersOfServiceWithRoles = require('./listUsersOfServiceWithRoles');
const listRolesOfService = require('./listRolesOfService');
const listPoliciesOfService = require('./listPoliciesOfService');
const createPolicyOfService = require('./createPolicyOfService');
const getPolicyOfService = require('./getPolicyOfService');
const updatePolicyOfService = require('./updatePolicyOfService');
const deletePolicyOfService = require('./deletePolicyOfService');
const pageOfPoliciesForService = require('./pageOfPoliciesForService');


const router = express.Router();

const routeUserService = async (req,res,next) => {
  switch((req.query && req.query.version)? req.query.version:null) {
    case 'v2':
      await listUsersOfServiceWithRoles(req,res,next);
      break;
    case 'v1':
    default:
      next();
      break;
  }
}
const buildArea = () => {
  router.get('/:sid/users', asyncWrapper(listUsersOfService));
  router.get('/:sid/organisations/:oid/users', routeUserService, asyncWrapper(listUsersOfServiceAtOrganisation));
  router.get('/:sid/roles', asyncWrapper(listRolesOfService));
  router.get('/:sid/policies', asyncWrapper(listPoliciesOfService));
  router.get('/v2/:sid/policies', asyncWrapper(pageOfPoliciesForService));
  router.post('/:sid/policies', asyncWrapper(createPolicyOfService));
  router.get('/:sid/policies/:pid', asyncWrapper(getPolicyOfService));
  router.patch('/:sid/policies/:pid', asyncWrapper(updatePolicyOfService));
  router.delete('/:sid/policies/:pid', asyncWrapper(deletePolicyOfService));

  return router;
};

module.exports = buildArea;
