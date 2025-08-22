const logger = require("../../infrastructure/logger");
const { getRole, updateRole } = require("../../infrastructure/data");

const validate = (req) => {
  const keys = Object.keys(req.body);
  // TODO Name length validation
  // TODO Code length validation
  const patchableProperties = ["name", "code"];
  if (keys.length === 0) {
    return `Must specify at least one property. Patchable properties ${patchableProperties}`;
  }
  const errorMessages = keys.map((key) => {
    if (!patchableProperties.find((x) => x === key)) {
      return `Unpatchable property ${key}. Allowed properties ${patchableProperties}`;
    }
    return null;
  });
  return errorMessages.find((x) => x !== null);
};

const updateRole = async (req, res) => {
  const { correlationId } = req;

  logger.info(`Patching role ${req.params.id}`, { correlationId });

  try {
    const validationErrorMessage = validate(req);
    if (validationErrorMessage) {
      return res.status(400).send({ details: validationErrorMessage });
    }

    const existingRoleEntity = await getRole(req.params.id);
    if (!existingRoleEntity) {
      return res.status(404).send();
    }

    await updateRole(existingRoleEntity, req.body);

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
