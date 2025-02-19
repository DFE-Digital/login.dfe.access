const uniq = require("lodash/uniq");
const uuid = require("uuid");
const logger = require("../../infrastructure/logger");
const {
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
} = require("../../infrastructure/data");

const validateRequest = (req) => {
  const model = {
    name: req.body.name,
    applicationId: req.params.sid,
    status: 0,
    conditions: req.body.conditions,
    roles: req.body.roles,
    errors: [],
  };

  if (!model.name) {
    model.errors.push("Name must be specified");
  }

  if (!model.conditions) {
    model.errors.push("Conditions must be specified");
  } else if (!(model.conditions instanceof Array)) {
    model.errors.push("Conditions must be an array");
  } else if (model.conditions.length === 0) {
    model.errors.push("Conditions must have at least one entry");
  } else {
    const entryErrors = [];
    model.conditions.forEach((condition) => {
      if (!condition.field) {
        entryErrors.push("Conditions entries must have field");
      }

      if (!condition.operator) {
        entryErrors.push("Conditions entries must have operator");
      }

      if (!condition.value) {
        entryErrors.push("Conditions entries must have value");
      } else if (!(condition.value instanceof Array)) {
        model.errors.push("Conditions entries value must be an array");
      }
    });
    if (entryErrors) {
      model.errors.push(...uniq(entryErrors));
    }
  }

  if (!model.roles) {
    model.errors.push("Roles must be specified");
  } else if (!(model.roles instanceof Array)) {
    model.errors.push("Roles must be an array");
  } else if (model.roles.length === 0) {
    model.errors.push("Roles must have at least one entry");
  } else {
    const entryErrors = [];
    model.roles.forEach((role) => {
      if (!role.id) {
        entryErrors.push("Roles entries must have id");
      }
    });
    if (entryErrors) {
      model.errors.push(...uniq(entryErrors));
    }
  }

  return model;
};
const createPolicyOfService = async (req, res) => {
  const { correlationId } = req;
  const model = validateRequest(req);

  logger.debug(`Getting policies for service ${model.applicationId}`, {
    correlationId,
  });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({
        errors: model.errors,
      });
    }

    const policyId = uuid.v4();
    await addPolicy(policyId, model.name, model.applicationId, 1);
    for (let i = 0; i < model.conditions.length; i++) {
      const condition = model.conditions[i];
      for (let j = 0; j < condition.value.length; j += 1) {
        await addPolicyCondition(
          uuid.v4(),
          policyId,
          condition.field,
          condition.operator,
          condition.value[j],
        );
      }
    }
    for (let i = 0; i < model.roles.length; i++) {
      const role = model.roles[i];
      await addPolicyRole(policyId, role.id);
    }

    return res
      .set("Location", `/services/${model.applicationId}/policies/${policyId}`)
      .status(201)
      .send({
        id: policyId,
      });
  } catch (e) {
    logger.error(`Error getting policies for service ${model.applicationId}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = createPolicyOfService;
