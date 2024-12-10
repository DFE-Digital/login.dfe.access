const logger = require("../../infrastructure/logger");
const {
  getInvitationServices,
  addUserService,
  addUserServiceIdentifier,
  addUserServiceRole,
} = require("../../infrastructure/data");

const parseAndValidateRequest = (req) => {
  const model = {
    iid: req.params.iid,
    uid: req.body.userId,
    errors: [],
  };

  if (!model.uid) {
    model.errors.push("Must specify userId");
  }

  return model;
};
const migrateServiceMapping = async (service, uid) => {
  await addUserService(uid, service.serviceId, service.organisationId);
  for (let i = 0; i < service.identifiers.length; i++) {
    const { key, value } = service.identifiers[i];
    await addUserServiceIdentifier(
      uid,
      service.serviceId,
      service.organisationId,
      key,
      value,
    );
  }
  for (let i = 0; i < service.roles.length; i++) {
    await addUserServiceRole(
      uid,
      service.serviceId,
      service.organisationId,
      service.roles[i].id,
    );
  }
};

const migrateInvitationToUser = async (req, res) => {
  const correlationId = req.correlationId;
  const model = parseAndValidateRequest(req);
  const { iid, uid } = model;

  logger.info(`Migrating invitation ${iid} to ${uid}`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(400).send({ details: model.errors });
    }

    const services = await getInvitationServices(iid);
    for (let i = 0; i < services.length; i++) {
      await migrateServiceMapping(services[i], uid);
    }

    return res.status(202).send();
  } catch (e) {
    logger.error(`Error migrating invitation ${iid} to ${uid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = migrateInvitationToUser;
