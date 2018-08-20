const logger = require('./../../infrastructure/logger');
const { addUserServiceIdentifier } = require('./../../infrastructure/data');

const parseAndValidateRequest = (req) => {
  const model = {
    uid: req.params.uid,
    sid: req.params.sid,
    oid: req.params.oid,
    key: req.params.idkey,
    value: req.body.value,
    errors: [],
  };

  if (model.value === undefined || model.value === null) {
    model.errors.push('Must specify value');
  }

  return model;
};

const addServiceIdentifierToUser = async (req, res) => {
  const correlationId = req.correlationId;
  const model = parseAndValidateRequest(req);
  const { uid, oid, sid, key, value } = model;

  logger.info(`Adding service identifier with key ${key} and value ${value} ti ${sid} with org ${oid} for user ${uid} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await addUserServiceIdentifier(uid, sid, oid, key, value);

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error adding service identifier with key ${key} and value ${value} ti ${sid} with org ${oid} for user ${uid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = addServiceIdentifierToUser;
