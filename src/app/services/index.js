const express = require("express");
const { body } = require("express-validator");
const { asyncWrapper } = require("login.dfe.express-error-handling");

const listUsersOfService = require("./listUsersOfService");
const listUsersOfServiceAtOrganisation = require("./listUsersOfServiceAtOrganisation");
const listUsersOfServiceWithRoles = require("./listUsersOfServiceWithRoles");
const listRolesOfService = require("./listRolesOfService");
const updateRoleOfService = require("./updateRoleOfService");
const listPoliciesOfService = require("./listPoliciesOfService");
const createPolicyOfService = require("./createPolicyOfService");
const createRolesOfService = require("./createRolesOfService");

const getPolicyOfService = require("./getPolicyOfService");
const updatePolicyOfService = require("./updatePolicyOfService");
const deletePolicyOfService = require("./deletePolicyOfService");
const pageOfPoliciesForService = require("./pageOfPoliciesForService");
const updateServiceRequest = require("./updateServiceRequest");

const router = express.Router();

const routeUserService = async (req, res, next) => {
  switch (req.query && req.query.version ? req.query.version : null) {
    case "v2":
      await listUsersOfServiceWithRoles(req, res, next);
      break;
    case "v1":
    default:
      next();
  }
};
const buildArea = () => {
  // The GET version of this endpoint should generally be used.  The POST
  // endpoint should mainly be used if there is too much data to put in
  // the query of the url (e.g., 100s of userIds for example)
  router.get("/:sid/users", asyncWrapper(listUsersOfService));
  router.post("/:sid/users", asyncWrapper(listUsersOfService));

  router.get(
    "/:sid/organisations/:oid/users",
    routeUserService,
    asyncWrapper(listUsersOfServiceAtOrganisation),
  );
  router.get("/:sid/roles", asyncWrapper(listRolesOfService));
  router.post("/:sid/roles", asyncWrapper(createRolesOfService));

  router.get("/:sid/policies", asyncWrapper(listPoliciesOfService));
  router.get("/v2/:sid/policies", asyncWrapper(pageOfPoliciesForService));
  router.post("/:sid/policies", asyncWrapper(createPolicyOfService));
  router.get("/:sid/policies/:pid", asyncWrapper(getPolicyOfService));
  router.patch("/:sid/policies/:pid", asyncWrapper(updatePolicyOfService));
  router.delete("/:sid/policies/:pid", asyncWrapper(deletePolicyOfService));

  router.patch(
    "/requests/:id",
    body("status", "status must be an number").optional().isNumeric(),
    body("actioned_by", "actioned_by must be a uuid").optional().isUUID(),
    body(
      "actioned_reason",
      "actioned_reason has a maxiumum length of 5000 characters",
    )
      .optional()
      .isLength({ max: 5000 }),
    body("actioned_at", "actioned_at must be a date").optional().isISO8601(),
    asyncWrapper(updateServiceRequest),
  );

  router.patch("/:sid/roles/:rid", asyncWrapper(updateRoleOfService));

  return router;
};

module.exports = buildArea;
