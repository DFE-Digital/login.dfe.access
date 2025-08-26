const logger = require("../../infrastructure/logger");
const { getRole, updateRoleEntity } = require("../../infrastructure/data");

const validate = (req) => {
  const keys = Object.keys(req.body);
  const errors = [];
  const patchableProperties = ["name", "code"];

  if (keys.length === 0) {
    errors.push(
      `Must specify at least one property. Patchable properties ${patchableProperties}`,
    );
  }
  keys.map((key) => {
    if (!patchableProperties.find((x) => x === key)) {
      errors.push(
        `Unpatchable property ${key}. Allowed properties ${patchableProperties}`,
      );
    }
    if (key === "name") {
      const name = req.body.name;
      if (!name) {
        errors.push("'name' cannot be empty");
      } else if (name.length > 125) {
        errors.push("'name' cannot be greater than 125 characters");
      }
    }
    if (key === "code") {
      const code = req.body.code;
      if (!code) {
        errors.push("'code' cannot be empty");
      } else if (code.length > 50) {
        errors.push("'code' cannot be greater than 50 characters");
      }
    }
  });

  return errors;
};

const updateRole = async (req, res) => {
  const { correlationId } = req;

  logger.info(`Patching role ${req.params.id}`, { correlationId });

  try {
    const validationErrorMessages = validate(req);
    if (validationErrorMessages.length > 0) {
      return res.status(400).send({ errors: validationErrorMessages });
    }

    const existingRoleEntity = await getRole(req.params.id);
    if (!existingRoleEntity) {
      return res.status(404).send();
    }

    await updateRoleEntity(existingRoleEntity, req.body);

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error patching role ${req.params.id}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = updateRole;
