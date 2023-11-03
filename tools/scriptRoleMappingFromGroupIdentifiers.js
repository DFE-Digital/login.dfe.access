const { getPageOfUserServices, getPageOfInvitationServices, getServiceRoles } = require('./../src/infrastructure/data');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const serviceRoleCache = [];

const mapAsync = async (source, iteratee) => {
  const mapped = [];
  for (let i = 0; i < source.length; i += 1) {
    const result = await iteratee(source[i]);
    mapped.push(result);
  }
  return mapped;
};

const getUserGroups = async () => {
  const userGroups = [];
  let pageNumber = 1;
  let hasMorePages = true;
  let numberOfPages;
  while (hasMorePages) {
    console.info(`Reading page ${pageNumber}${numberOfPages ? ` of ${numberOfPages}` : ''} of user service mappings`);
    const page = await getPageOfUserServices(pageNumber, 500);
    const mappingsWithGroups = page.services.filter(s => s.identifiers && s.identifiers.find(i => i.key === 'groups'));

    userGroups.push(...mappingsWithGroups.map(m => ({
      userId: m.userId,
      serviceId: m.serviceId,
      organisationId: m.organisationId,
      groups: m.identifiers.find(i => i.key === 'groups').value.split(',').map(x => x.trim()),
    })));

    pageNumber += 1;
    numberOfPages = page.numberOfPages;
    hasMorePages = pageNumber <= page.numberOfPages;
  }
  return userGroups;
};
const getInvitationGroups = async () => {
  const invitationGroups = [];
  let pageNumber = 1;
  let hasMorePages = true;
  let numberOfPages;
  while (hasMorePages) {
    console.info(`Reading page ${pageNumber}${numberOfPages ? ` of ${numberOfPages}` : ''} of invitation service mappings`);
    const page = await getPageOfInvitationServices(pageNumber, 500);
    const mappingsWithGroups = page.services.filter(s => s.identifiers && s.identifiers.find(i => i.key === 'groups'));

    invitationGroups.push(...mappingsWithGroups.map(m => ({
      invitationId: m.invitationId,
      serviceId: m.serviceId,
      organisationId: m.organisationId,
      groups: m.identifiers.find(i => i.key === 'groups').value.split(',').map(x => x.trim()),
    })));

    pageNumber += 1;
    numberOfPages = page.numberOfPages;
    hasMorePages = pageNumber <= page.numberOfPages;
  }
  return invitationGroups;
};
const getServiceRolesFromCacheOrRepo = async (serviceId) => {
  let map = serviceRoleCache.find(s => s.serviceId === serviceId);
  if (!map) {
    const roles = await getServiceRoles(serviceId);
    map = { serviceId, roles };
    serviceRoleCache.push(map);
  }
  return map.roles;
};
const mapGroupsToRoles = async (userGroups) => {
  return mapAsync(userGroups, async (userGroup) => {
    const serviceRoles = await getServiceRolesFromCacheOrRepo(userGroup.serviceId);
    const roles = userGroup.groups.map((g) => {
      const role = serviceRoles.find(r => r.code.toLowerCase() === g.toLowerCase());
      if (!role) {
        throw new Error(`No role exists in service ${userGroup.serviceId} with code ${g} (mapping for user ${userGroup.userId} in org ${userGroup.organisationId})`);
      }
      return role;
    });
    return {
      userId: userGroup.userId,
      invitationId: userGroup.invitationId,
      serviceId: userGroup.serviceId,
      organisationId: userGroup.organisationId,
      roles,
    };
  });
};
const writeScript = async (roles, tableName, identifierColumnName, saveToPath) => {
  const sql = roles.map((entityRoles) => {
    let batch = '---------------------------------------------------------------------------------------\n';
    batch += `-- ${entityRoles.userId ? `userId:${entityRoles.userId}` : `invitationId:${entityRoles.invitationId}`} / serviceId:${entityRoles.serviceId} / organisationId:${entityRoles.organisationId}\n`;
    batch += '---------------------------------------------------------------------------------------\n';
    entityRoles.roles.forEach((role) => {
      batch += `INSERT INTO ${tableName}\n`;
      batch += `(id, ${identifierColumnName}, service_id, organisation_id, role_id, createdAt, updatedAt)\n`;
      batch += 'VALUES\n';
      batch += `('${uuid.v4()}', '${entityRoles.userId ? entityRoles.userId : entityRoles.invitationId}', '${entityRoles.serviceId}', '${entityRoles.organisationId}', '${role.id}', GETDATE(), GETDATE())\n\n`;
    });
    return batch;
  }).join('\n');
  fs.writeFileSync(saveToPath, sql, 'utf8');
};

const run = async () => {
  const usersPath = path.join(path.resolve(process.env.OUTPUT_DIR), 'user_role_mapping_from_identifiers.sql');
  const invitationsPath = path.join(path.resolve(process.env.OUTPUT_DIR), 'invitation_role_mapping_from_identifiers.sql');

  const userGroups = await getUserGroups();
  const userRoles = await mapGroupsToRoles(userGroups);
  const invitationGroups = await getInvitationGroups();
  const invitationRoles = await mapGroupsToRoles(invitationGroups);

  await writeScript(userRoles, 'user_service_roles', 'user_id', usersPath);
  await writeScript(invitationRoles, 'invitation_service_roles', 'invitation_id', invitationsPath);

  return { usersPath, invitationsPath };
};
run().then(({ usersPath, invitationsPath }) => {
  console.info('Done');
  console.info(`User mappings saved to ${usersPath}`);
  console.info(`Invitation mappings saved to ${invitationsPath}`);
}).catch((e) => {
  console.error(e.stack);
}).then(() => {
  process.exit();
});
