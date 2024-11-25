const logger = require('../../infrastructure/logger');
const {
  removeInvitationService,
  removeAllInvitationServiceIdentifiers,
  removeAllInvitationServiceRoles,
} = require('../../infrastructure/data');

const parseAndValidateRequest = (req) => {
  const model = {
    iid: req.params.iid,
    sid: req.params.sid,
    oid: req.params.oid,
    errors: [],
  };

  if (!model.oid) {
    model.errors.push('Must specify organisation');
  }

  return model;
};

const removeServiceFromInvitation = async (req, res) => {
  const model = parseAndValidateRequest(req);
  const { iid, oid, sid } = model;
  const { correlationId } = req;

  logger.info(`Removing service ${sid} for org ${oid} from invitation ${iid}`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await removeAllInvitationServiceIdentifiers(iid, sid, oid);
    await removeAllInvitationServiceRoles(iid, sid, oid);
    await removeInvitationService(iid, sid, oid);

    return res.status(204).send();
  } catch (e) {
    logger.error(`Error removing service ${sid} for org ${oid} from invitation ${iid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = removeServiceFromInvitation;
