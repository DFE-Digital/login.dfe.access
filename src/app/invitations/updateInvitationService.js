const logger = require('./../../infrastructure/logger');

const { getInvitationService, addInvitationServiceIdentifier, removeAllInvitationServiceIdentifiers, getServiceRoles, getUserOfServiceIdentifier, removeAllInvitationServiceRoles, addInvitationServiceRole } = require('./../../infrastructure/data');

const parseAndValidateRequest = async (req) => {
  const model = {
    iid: req.params.iid,
    sid: req.params.sid,
    oid: req.params.oid,
    identifiers: req.body.identifiers || [],
    roles: req.body.roles || [],
    errors: [],
    errorStatus: 400,
  };

  if (!model.oid) {
    model.errors.push('Must specify organisation');
  }

  if (!(model.identifiers instanceof Array)) {
    model.errors.push('Identifiers must be an array');
  } else {
    let allItemsOk = true;
    for (let i = 0; i < model.identifiers.length; i += 1) {
      const item = model.identifiers[i];

      const keys = Object.keys(item);
      if (!keys.find(x => x === 'key') || !keys.find(x => x === 'value')) {
        allItemsOk = false;
      } else if (await getUserOfServiceIdentifier(model.sid, item.key, item.value)) {
        model.errors.push(`Identifier ${item.key} already in use`);
        model.errorStatus = 409;
      }
    }
    if (!allItemsOk) {
      model.errors.push('Identifiers items must contain key and value');
    }
  }

  if (!(model.roles instanceof Array)) {
    model.errors.push('Roles must be an array');
  } else {
    const availableRolesForService = await getServiceRoles(model.sid);
    model.roles.forEach((roleId) => {
      const safeRoleId = (roleId || '').toLowerCase();
      if (!availableRolesForService.find(x => x.id.toLowerCase() === safeRoleId.toLowerCase())) {
        model.errors.push(`Role ${roleId} is not available for service ${model.sid}`);
      }
    });
  }

  return model;
};

const updateInvitationService = async (req, res) => {
  const correlationId = req.correlationId;
  const model = await parseAndValidateRequest(req);
  const { iid, oid, sid, identifiers, roles } = model;

  logger.info(`Updating service ${sid} with org ${oid} for invitation ${iid} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (model.errors.length > 0) {
      return res.status(model.errorStatus).send({ details: model.errors });
    }

    const invitationService = await getInvitationService(iid, sid, oid);
    if (!invitationService) {
      return res.status(404).send();
    }

    if (identifiers.length > 0) {
      await removeAllInvitationServiceIdentifiers(iid, sid, oid);
      for (let i = 0; i < identifiers.length; i += 1) {
        await addInvitationServiceIdentifier(iid, sid, oid, identifiers[i].key, identifiers[i].value);
      }
    }

    if (roles.length === 0 || roles === undefined) {
      await removeAllInvitationServiceRoles(iid, sid, oid);
    }

    if (roles.length > 0) {
      await removeAllInvitationServiceRoles(iid, sid, oid);
      for (let i = 0; i < roles.length; i += 1) {
        await addInvitationServiceRole(iid, sid, oid, roles[i]);
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

module.exports = updateInvitationService;
