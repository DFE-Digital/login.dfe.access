const mapUserServiceEntity = async (entity) => {
  if (!entity) {
    return undefined;
  }
  const identifiers = (await entity.getIdentifiers() || []).map(x => ({
    key: x.identifier_key,
    value: x.identifier_value
  }));
  const groups = identifiers.find(x => x.key === 'groups');
  const roles = (groups ? groups.value : '').split(',').filter(x => x.length > 0);
  return Promise.resolve({
    userId: entity.user_id || undefined,
    invitationId: entity.invitation_id || undefined,
    serviceId: entity.service_id,
    organisationId: entity.organisation_id || undefined,
    roles,
    identifiers,
    accessGrantedOn: entity.createdAt,
  });
};
const mapUserServiceEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapUserServiceEntity(entities[i]));
  }
  return mapped;
};

module.exports = {
  mapUserServiceEntity,
  mapUserServiceEntities,
};
