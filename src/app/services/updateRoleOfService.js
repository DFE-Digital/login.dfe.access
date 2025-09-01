const logger = require("../../infrastructure/logger");
const { getServiceRoles, updateRole } = require("../../infrastructure/data");

const validate = (req, serviceRoles) => {
  const keys = Object.keys(req.body);
  const errors = [];
  const patchableProperties = ["name", "code"];

  if (keys.length === 0) {
    errors.push(
      `Must specify at least one property. Patchable properties ${patchableProperties}`,
    );
  }
  keys.forEach((key) => {
    if (!patchableProperties.find((x) => x === key)) {
      errors.push(
        `Unpatchable property ${key}. Allowed properties ${patchableProperties}`,
      );
    }
    if (key === "name") {
      const name = req.body.name;
      if (!name || typeof name !== "string") {
        errors.push("'name' must be a non-empty string");
      } else if (name.length > 125) {
        errors.push("'name' cannot be greater than 125 characters");
      }
    }
    if (key === "code") {
      const code = req.body.code;
      if (!code || typeof code !== "string") {
        errors.push("'code' must be a non-empty string");
      } else if (code.length > 50) {
        errors.push("'code' cannot be greater than 50 characters");
      } else {
        // Codes need to be unique for roles within the service. Only raise an error
        // if there's a matching code within the service and it's NOT for the role we're currently
        // changing.
        const roleWithMatchingCode = serviceRoles.find(
          (role) => role.code === code,
        );
        if (
          roleWithMatchingCode &&
          roleWithMatchingCode.id.toLowerCase() !== req.params.rid
        ) {
          errors.push("'code' has to be unique for roles within the service");
        }
      }
    }
  });

  return errors;
};

const updateRoleOfService = async (req, res) => {
  const { correlationId } = req;
  const serviceId = req.params.sid.toLowerCase();
  const roleId = req.params.rid.toLowerCase();

  logger.info(`Patching role [${roleId}] for service [${serviceId}]`, {
    correlationId,
  });

  try {
    const serviceRoles = await getServiceRoles(serviceId);
    // Before we do anything, verify this role exists for this service
    if (!serviceRoles.find((role) => role.id.toLowerCase() === roleId)) {
      return res.status(404).send();
    }

    const validationErrorMessages = validate(req, serviceRoles);
    if (validationErrorMessages.length > 0) {
      return res.status(400).send({ errors: validationErrorMessages });
    }

    await updateRole(roleId, req.body);

    logger.info(
      `Successfully patched role [${roleId}] for service [${serviceId}]`,
      {
        correlationId,
      },
    );

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error patching role [${roleId}] for service [${serviceId}]`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = updateRoleOfService;
