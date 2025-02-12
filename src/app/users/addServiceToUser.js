const logger = require("../../infrastructure/logger");
const { notifyUserUpdated } = require("../../infrastructure/notifications");
const {
  addUserService,
  addUserServiceIdentifier,
  removeAllUserServiceIdentifiers,
  getServiceRoles,
  removeAllUserServiceRoles,
  addUserServiceRole,
} = require("../../infrastructure/data");

const parseAndValidateRequest = async (req) => {
  const model = {
    uid: req.params.uid,
    sid: req.params.sid,
    oid: req.params.oid,
    identifiers: req.body.identifiers || [],
    roles: req.body.roles || [],
    errors: [],
  };

  if (!model.oid) {
    model.errors.push("Must specify organisation");
  }

  if (!(model.identifiers instanceof Array)) {
    model.errors.push("Identifiers must be an array");
  } else {
    let allItemsOk = true;
    model.identifiers.forEach((item) => {
      const keys = Object.keys(item);
      if (!keys.find((x) => x === "key") || !keys.find((x) => x === "value")) {
        allItemsOk = false;
      }
    });
    if (!allItemsOk) {
      model.errors.push("Identifiers items must contain key and value");
    }
  }

  if (!(model.roles instanceof Array)) {
    model.errors.push("Roles must be an array");
  } else {
    const availableRolesForService = await getServiceRoles(model.sid);
    model.roles.forEach((roleId) => {
      const safeRoleId = (roleId || "").toLowerCase();
      if (
        !availableRolesForService.find(
          (x) => x.id.toLowerCase() === safeRoleId.toLowerCase(),
        )
      ) {
        model.errors.push(
          `Role ${roleId} is not available for service ${model.sid}`,
        );
      }
    });
  }

  return model;
};

const addServiceToUser = async (req, res) => {
  const { correlationId } = req;
  const model = await parseAndValidateRequest(req);
  const { uid, oid, sid, identifiers, roles } = model;

  logger.info(`Adding service ${sid} with org ${oid} to user ${uid}`, {
    correlationId,
  });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    await addUserService(uid, sid, oid);
    await removeAllUserServiceIdentifiers(uid, sid, oid);
    if (identifiers.length > 0) {
      for (let i = 0; i < identifiers.length; i += 1) {
        await addUserServiceIdentifier(
          uid,
          sid,
          oid,
          identifiers[i].key,
          identifiers[i].value,
        );
      }
    }

    await removeAllUserServiceRoles(uid, sid, oid);
    if (roles.length > 0) {
      for (let i = 0; i < roles.length; i += 1) {
        await addUserServiceRole(uid, sid, oid, roles[i]);
      }
    }

    await notifyUserUpdated(uid);

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error adding service ${sid} with org ${oid} to user ${uid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = addServiceToUser;
