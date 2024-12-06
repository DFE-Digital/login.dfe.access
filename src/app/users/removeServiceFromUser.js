const logger = require("../../infrastructure/logger");
const { notifyUserUpdated } = require("../../infrastructure/notifications");
const {
  removeUserService,
  removeAllUserServiceIdentifiers,
  removeAllUserServiceRoles,
} = require("../../infrastructure/data");

const parseAndValidateRequest = (req) => {
  const model = {
    uid: req.params.uid,
    sid: req.params.sid,
    oid: req.params.oid,
    errors: [],
  };

  if (!model.oid) {
    model.errors.push("Must specify organisation");
  }

  return model;
};

const removeServiceFromUser = async (req, res) => {
  const { correlationId } = req;
  const model = parseAndValidateRequest(req);
  const { uid, oid, sid } = model;

  logger.info(`Removing service ${sid} with org ${oid} from user ${uid}`, {
    correlationId,
  });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await removeAllUserServiceRoles(uid, sid, oid);
    await removeAllUserServiceIdentifiers(uid, sid, oid);
    await removeUserService(uid, sid, oid);

    await notifyUserUpdated(uid);

    return res.status(204).send();
  } catch (e) {
    logger.error(
      `Error removing service ${sid} with org ${oid} from user ${uid}`,
      {
        correlationId,
        error: { ...e },
      },
    );
    throw e;
  }
};

module.exports = removeServiceFromUser;
