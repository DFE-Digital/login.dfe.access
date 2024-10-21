const logger = require('../../infrastructure/logger');
const uniq = require('lodash/uniq');
const { getUserServiceRequest, addUserServiceRequest } = require('../../infrastructure/data');
const uuid = require('uuid');

const validateRequest = (req) => {
  const model = {
    id: req.params.id,
    userId: req.body.user_id,
    serviceId: req.body.service_id,
    roles: req.body.role_ids,
    organisationId: req.body.organisation_id,
    status: req.body.status,
    reason: req.body.reason,
    actionedBy: req.body.actioned_by,
    actionedReason: req.body.actioned_reason,
    actionedAt: req.body.actioned_at,
    createdAt: req.body.createdAt,
    updatedAt: req.body.updatedAt,
    requestType: req.body.request_type,
    errors: [],
  };

  // TODO need to figure out validation
  // if (model.conditions && !(model.conditions instanceof Array)) {
  //   model.errors.push('Conditions must be an array');
  // } else if (model.conditions && model.conditions.length === 0) {
  //   model.errors.push('Conditions must have at least one entry');
  // } else if (model.conditions) {
  //   const entryErrors = [];
  //   model.conditions.forEach((condition) => {
  //     if (!condition.field) {
  //       entryErrors.push('Conditions entries must have field');
  //     }

  //     if (!condition.operator) {
  //       entryErrors.push('Conditions entries must have operator');
  //     }

  //     if (!condition.value) {
  //       entryErrors.push('Conditions entries must have value');
  //     } else if (!(condition.value instanceof Array)) {
  //       model.errors.push('Conditions entries value must be an array');
  //     }
  //   });
  //   if (entryErrors) {
  //     model.errors.push(...uniq(entryErrors));
  //   }
  // }

  return model;
};

const updateRequest = async (model, existingRequest) => {
  const updatedRequest = Object.assign({}, existingRequest, {
    id: existingRequest.id,
    status: model.status || existingRequest.status,
    reason:  model.reason || existingRequest.reason,
    actionedBy:  model.actioned_by || existingRequest.actioned_by,
    actionedReason:  model.actioned_reason || existingRequest.actioned_reason,
  });
  await addUserServiceRequest(updatedRequest.id, updatedRequest.status, updatedRequest.reason, updatedRequest.actionedBy, updatedRequest.actionedReason);
};

const updateServiceRequest = async (req, res) => {
  const correlationId = req.correlationId;
  const model = validateRequest(req);

  logger.info(`Patching request ${model.id} for service ${model.applicationId} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({
        errors: model.errors,
      });
    }

    const existingServiceRequest = await getUserServiceRequest(model.id);
    if (!existingServiceRequest || existingServiceRequest.applicationId.toLowerCase() !== model.applicationId.toLowerCase()) {
      return res.status(404).send();
    }

    await updateRequest(model, existingServiceRequest);

    // TODO why is it 202? Once we're here it's already been updated so why not 200?
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error patching request ${model.id} for service ${model.applicationId} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = updateServiceRequest;
