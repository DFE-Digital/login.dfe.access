const uniq = require("lodash/uniq");
const uuid = require("uuid");
const logger = require("../../infrastructure/logger");
const {
  getPolicy,
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
  deletePolicyConditions,
  deletePolicyRoles,
} = require("../../infrastructure/data");

const validateRequest = (req) => {
  const model = {
    id: req.params.pid,
    name: req.body.name,
    applicationId: req.params.sid,
    status:
      req.body.status && req.body.status.id !== undefined
        ? req.body.status.id
        : undefined,
    conditions: req.body.conditions,
    roles: req.body.roles,
    errors: [],
  };

  if (model.conditions && !(model.conditions instanceof Array)) {
    model.errors.push("Conditions must be an array");
  } else if (model.conditions && model.conditions.length === 0) {
    model.errors.push("Conditions must have at least one entry");
  } else if (model.conditions) {
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

  if (model.roles && !(model.roles instanceof Array)) {
    model.errors.push("Roles must be an array");
  } else if (model.roles && model.roles.length === 0) {
    model.errors.push("Roles must have at least one entry");
  } else if (model.roles) {
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

const updatePolicy = async (model, existingPolicy) => {
  const updatedPolicy = Object.assign({}, existingPolicy, {
    name: model.name || existingPolicy.name,
    applicationId: model.applicationId || existingPolicy.applicationId,
    status: {
      id: model.status !== undefined ? model.status : existingPolicy.status.id,
    },
  });
  await addPolicy(
    updatedPolicy.id,
    updatedPolicy.name,
    updatedPolicy.applicationId,
    updatedPolicy.status.id,
  );
};
const updateConditions = async (model, existingPolicy) => {
  if (model.conditions) {
    await deletePolicyConditions(model.id);
    for (let i = 0; i < model.conditions.length; i++) {
      const condition = model.conditions[i];
      for (let j = 0; j < condition.value.length; j += 1) {
        await addPolicyCondition(
          uuid.v4(),
          model.id,
          condition.field,
          condition.operator,
          condition.value[j],
        );
      }
    }
  }
};
const updateRoles = async (model, existingPolicy) => {
  if (model.roles) {
    await deletePolicyRoles(model.id);
    for (let i = 0; i < model.roles.length; i++) {
      const role = model.roles[i];
      await addPolicyRole(model.id, role.id);
    }
  }
};

const updatePolicyOfService = async (req, res) => {
  const { correlationId } = req;
  const model = validateRequest(req);

  logger.info(
    `Patching policy ${model.id} for service ${model.applicationId}`,
    { correlationId },
  );
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({
        errors: model.errors,
      });
    }

    const existingPolicy = await getPolicy(model.id);
    if (
      !existingPolicy ||
      existingPolicy.applicationId.toLowerCase() !==
        model.applicationId.toLowerCase()
    ) {
      return res.status(404).send();
    }

    await updatePolicy(model, existingPolicy);
    await updateConditions(model, existingPolicy);
    await updateRoles(model, existingPolicy);

    return res
      .set("Location", `/services/${model.applicationId}/policies/${model.id}`)
      .status(202)
      .send();
  } catch (e) {
    logger.error(
      `Error patching policy ${model.id} for service ${model.applicationId}`,
      {
        correlationId,
        error: { ...e },
      },
    );
    throw e;
  }
};

module.exports = updatePolicyOfService;
