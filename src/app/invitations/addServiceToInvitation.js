const logger = require('./../../infrastructure/logger');
const { addInvitationService, addInvitationServiceIdentifier, removeAllInvitationServiceIdentifiers } = require('./../../infrastructure/data');

const parseAndValidateRequest = (req) => {
  const model = {
    iid: req.params.iid,
    sid: req.params.sid,
    oid: req.params.oid,
    identifiers: req.body.identifiers || [],
    errors: [],
  };

  if (!model.oid) {
    model.errors.push('Must specify organisation');
  }

  if (!(model.identifiers instanceof Array)) {
    model.errors.push('Identifiers must be an array');
  } else {
    let allItemsOk = true;
    model.identifiers.forEach((item) => {
      const keys = Object.keys(item);
      if (!keys.find(x => x === 'key') || !keys.find(x => x === 'value')) {
        allItemsOk = false;
      }
    });
    if (!allItemsOk) {
      model.errors.push('Identifiers items must contain key and value');
    }
  }

  return model;
};

const addServiceToInvitation = async (req, res) => {
  const correlationId = req.correlationId;
  const model = parseAndValidateRequest(req);
  const { iid, oid, sid, identifiers } = model;

  logger.info(`Adding service ${sid} with org ${oid} to invitation ${iid} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await addInvitationService(iid, sid, oid);
    if (identifiers.length > 0) {
      await removeAllInvitationServiceIdentifiers(iid, sid, oid);
      for (let i = 0; i < identifiers.length; i += 1) {
        await addInvitationServiceIdentifier(iid, sid, oid, identifiers[i].key, identifiers[i].value);
      }
    }

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error adding service ${sid} with org ${oid} to invitation ${iid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = addServiceToInvitation;
