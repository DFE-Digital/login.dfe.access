const logger = require('../../infrastructure/logger');
const uniq = require('lodash/uniq');
const { getUserServiceRequest, updateUserServiceRequest } = require('../../infrastructure/data');
const uuid = require('uuid');


const patchableProperties = ['status', 'actioned_by', 'actioned_reason', 'actioned_at'];

const validate = (req) => {
  //TODO add rule if setting to rejected then the reasons must be added
  const keys = Object.keys(req.body);
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

  logger.info(`Patching request ${req.params.id} for service (correlation id: ${correlationId})`, { correlationId });

  try {
    const validationErrorMessage = validate(req);
    if (validationErrorMessage) {
      return res.status(400).send(validationErrorMessage);
    }

    const existingServiceRequest = await getUserServiceRequest(req.params.id);
    if (!existingServiceRequest) {
      return res.status(404).send();
    }

    await updateUserServiceRequest(req.params.id, req.body);

    // TODO why is it 202? Once we're here it's already been updated so why not 200?
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error patching request ${req.params.id} for service (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = updateServiceRequest;
