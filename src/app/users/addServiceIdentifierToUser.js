const logger = require("../../infrastructure/logger");
const { notifyUserUpdated } = require("../../infrastructure/notifications");
const {
  addUserServiceIdentifier,
  getUserOfServiceIdentifier,
} = require("../../infrastructure/data");

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
    model.errors.push("Must specify value");
  }

  return model;
};

const addServiceIdentifierToUser = async (req, res) => {
  const { correlationId } = req;
  const model = parseAndValidateRequest(req);
  const { uid, oid, sid, key, value } = model;

  logger.info(
    `Adding service identifier with key ${key} and value ${value} ti ${sid} with org ${oid} for user ${uid}`,
    { correlationId },
  );
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    if (await getUserOfServiceIdentifier(sid, key, value)) {
      return res.status(409).send({
        details: ["Identifier already in use"],
      });
    }

    await addUserServiceIdentifier(uid, sid, oid, key, value);

    await notifyUserUpdated(uid);

    return res.status(202).send();
  } catch (e) {
    logger.error(
      `Error adding service identifier with key ${key} and value ${value} ti ${sid} with org ${oid} for user ${uid}`,
      {
        correlationId,
        error: { ...e },
      },
    );
    throw e;
  }
};

module.exports = addServiceIdentifierToUser;
