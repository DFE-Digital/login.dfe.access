const { inspect } = require("util");
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

// Spreading an Error yields {} - its properties are non-enumerable - which
// drops exactly the detail needed to diagnose a failure from the logs.
// Non-Error rejection values are handled explicitly rather than assumed away:
// reading .name off null would throw here, replacing the failure being
// reported with a TypeError and defeating the point of the caller's catch.
const serialiseError = (error) =>
  error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { name: typeof error, message: inspect(error) };

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

    try {
      await notifyUserUpdated(uid, sid, oid);
    } catch (notifyError) {
      // The access removal above has already succeeded - a WS sync
      // notification failure here must not turn a successful removal into
      // an error response to the caller.
      logger.warn(
        `Failed to notify legacy WS Sync on removal of service ${sid} with org ${oid} from user ${uid}`,
        {
          correlationId,
          uid,
          sid,
          oid,
          error: serialiseError(notifyError),
        },
      );
    }

    return res.status(204).send();
  } catch (e) {
    logger.error(
      `Error removing service ${sid} with org ${oid} from user ${uid}`,
      {
        correlationId,
        error: serialiseError(e),
      },
    );
    throw e;
  }
};

module.exports = removeServiceFromUser;
