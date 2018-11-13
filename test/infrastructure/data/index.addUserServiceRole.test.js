jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid/v4');

const uuid = require('uuid/v4');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addUserServiceRole } = require('./../../../src/infrastructure/data');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';
const rid = 'role1';

describe('When adding a role to a user service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should create the record', async () => {
     await addUserServiceRole(uid, sid, oid, rid);

    expect(repository.userServiceRoles.create).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRoles.create.mock.calls[0][0]).toMatchObject({
      id: 'new-uuid',
      user_id: uid,
      organisation_id: oid,
      service_id: sid,
      role_id: rid,
    });
  });
});