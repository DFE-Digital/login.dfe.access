const { validate } = require("uuid");

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
  } else {
    if (!validate(model.uid)) {
      model.errors.push("User must be a valid uuid");
    }
  }
  if (!model.sid) {
    model.errors.push("Must specify service");
  } else {
    if (!validate(model.sid)) {
      model.errors.push("Service must be a valid uuid");
    }
  }
  if (!model.oid) {
    model.errors.push("Must specify organisation");
  } else {
    if (!validate(model.oid)) {
      model.errors.push("Organisation must be a valid uuid");
    }
  }
  return model;
};

const updateLastAccess = async (req, res) => {
  const { correlationId } = req;
  const model = await parseAndValidateRequest(req);
  const { uid, oid, sid } = model;

  try {
    if (model.errors.length > 0) {
      logger.info(
        `Errors found, returning 400. [${model.errors}] (correlation id: ${correlationId})`,
        { correlationId },
      );
      return res.status(400).send({ details: model.errors });
    }
    logger.info(
      `Setting last access for service [${sid}] with org [${oid}] for user [${uid}] (correlation id: ${correlationId})`,
      { correlationId },
    );

    const userServicesRecordId = await updateUserServiceLastAccess(
      uid,
      sid,
      oid,
    );
    if (!userServicesRecordId) {
      logger.info(
        `No user service record was updated (correlation id: ${correlationId})`,
        { correlationId },
      );
      // If id is undefined, it couldn't find a record that contains the 3 values
      return res.status(404).send();
    }
    logger.info(
      `A userServices record with id [${userServicesRecordId}] was updated (correlation id: ${correlationId})`,
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
