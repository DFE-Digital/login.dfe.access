const mapUserServiceEntity = async (entity) => {
  if (!entity) {
    return undefined;
  }

  const identifiers = (entity.identifiers || await entity.getIdentifiers() || []).map(x => ({
    key: x.identifier_key,
    value: x.identifier_value
  }));

  const roles = await mapRoleEntities((entity.roles || await entity.getRoles() || []).map(x => x.role));

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

const mapRoleEntity = async (entity) => {
  if (!entity) {
    return undefined;
  }

  const role = {
    id: entity.id,
    name: entity.name,
    code: entity.code,
    numericId: entity.numericId,
    status: {
      id: entity.status,
    },
  };

  if (entity.parent) {
    role.parent = await mapRoleEntity(entity.parent);
  }

  return Promise.resolve(role);
};
const mapRoleEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapRoleEntity(entities[i]));
  }
  return mapped;
};

const mapPolicyEntity = async (entity) => {
  if (!entity) {
    return undefined;
  }

  const conditions = [];
  entity.conditions.forEach((conditionEntity) => {
    const condition = conditions.find(c => c.field === conditionEntity.field);
    if (condition) {
      condition.value.push(conditionEntity.value);
    } else {
      conditions.push({
        field: conditionEntity.field,
        operator: conditionEntity.operator,
        value: [conditionEntity.value],
      });
    }
  });

  const roles = await mapRoleEntities(entity.roles);

  return Promise.resolve({
    id: entity.id,
    name: entity.name,
    applicationId: entity.applicationId,
    status: {
      id: entity.status,
    },
    conditions,
    roles,
  });
};
const mapPolicyEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapPolicyEntity(entities[i]));
  }
  return mapped;
};

const mapUserServiceRole = async (entity) => {
  if (!entity) {
    return undefined;
  }
  return {
    userId: entity.user_id || undefined,
    serviceId: entity.service_id,
    organisationId: entity.organisation_id || undefined,
    roles: entity.role,
    accessGrantedOn: entity.createdAt,
  }
};

const mapUserServiceRoles = async (entities) => {
  if (!entities) {
    return undefined;
  }
  const mappedResult = []
  for (let i = 0; i < entities.length; i++) {
    mappedResult.push(await mapUserServiceRole(entities[i]));
  }
  return mappedResult;
}
module.exports = {
  mapUserServiceEntity,
  mapUserServiceEntities,
  mapRoleEntity,
  mapRoleEntities,
  mapPolicyEntity,
  mapPolicyEntities,
  mapUserServiceRoles,
};
