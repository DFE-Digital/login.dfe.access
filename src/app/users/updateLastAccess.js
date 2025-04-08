const logger = require("../../infrastructure/logger");
const { updateUserServiceLastAccess } = require("../../infrastructure/data");
const { notifyUserUpdated } = require("../../infrastructure/notifications");

const parseAndValidateRequest = async (req) => {
  const model = {
    uid: req.params.uid,
    sid: req.params.sid,
    oid: req.params.oid,
    errors: [],
  };
  if (!model.uid) {
    model.errors.push("Must specify user");
  }
  if (!model.sid) {
    model.errors.push("Must specify service");
  }
  if (!model.oid) {
    model.errors.push("Must specify organisation");
  }
  return model;
};

const updateLastAccess = async (req, res) => {
  const { correlationId } = req;
  const model = await parseAndValidateRequest(req);
  const { uid, oid, sid } = model;

  logger.info(
    `Setting last access for service ${sid} with org ${oid} for user ${uid} (correlation id: ${correlationId})`,
    { correlationId },
  );
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    const userServicesRecordId = await updateUserServiceLastAccess(
      uid,
      sid,
      oid,
    );
    logger.info(
      `A user_services record with id [${userServicesRecordId}] was updated (correlation id: ${correlationId})`,
      { correlationId },
    );

    notifyUserUpdated(uid);
    return res.status(202).send();
  } catch (e) {
    logger.error(
      `Error updating last access for service ${sid} with org ${oid} to user ${uid} (correlation id: ${correlationId}) - ${e.message}`,
      {
        correlationId,
        stack: e.stack,
      },
    );
    throw e;
  }
};

module.exports = updateLastAccess;
