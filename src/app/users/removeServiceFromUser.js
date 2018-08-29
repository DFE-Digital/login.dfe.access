const logger = require('./../../infrastructure/logger');
const { removeUserService, removeAllUserServiceIdentifiers } = require('./../../infrastructure/data');

const parseAndValidateRequest = (req) => {
  const model = {
    uid: req.params.uid,
    sid: req.params.sid,
    oid: req.params.oid,
    errors: [],
  };

  if (!model.oid) {
    model.errors.push('Must specify organisation');
  }

  return model;
};

const removeServiceFromUser = async (req, res) => {
  const correlationId = req.correlationId;
  const model = parseAndValidateRequest(req);
  const { uid, oid, sid } = model;

  logger.info(`Removing service ${sid} with org ${oid} from user ${uid} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await removeAllUserServiceIdentifiers(uid, sid, oid);
    await removeUserService(uid, sid, oid);

    return res.status(204).send();
  } catch (e) {
    logger.error(`Error removing service ${sid} with org ${oid} from user ${uid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = removeServiceFromUser;
