const logger = require('../../infrastructure/logger');
const { getUserServiceRequestEntity, updateUserServiceRequest } = require('../../infrastructure/data');

const validate = (req) => {
  const keys = Object.keys(req.body);
  const patchableProperties = ['status', 'actioned_by', 'actioned_reason', 'actioned_at'];
  if (keys.length === 0) {
    return `Must specify at least one property. Patchable properties ${patchableProperties}`;
  }
  const errorMessages = keys.map((key) => {
    if (!patchableProperties.find(x => x === key)) {
      return `Unpatchable property ${key}. Allowed properties ${patchableProperties}`;
    }
    return null;
  });
  return errorMessages.find(x => x !== null);
};

const updateServiceRequest = async (req, res) => {
  const correlationId = req.correlationId;

  logger.info(`Patching request ${req.params.id} (correlation id: ${correlationId})`, { correlationId });

  try {
    const validationErrorMessage = validate(req);
    if (validationErrorMessage) {
      return res.status(400).send({details: validationErrorMessage});
    }

    const existingServiceRequestEntity = await getUserServiceRequestEntity(req.params.id);
    if (!existingServiceRequestEntity) {
      return res.status(404).send();
    }

    await updateUserServiceRequest(existingServiceRequestEntity, req.body);

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error patching request ${req.params.id} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = updateServiceRequest;
