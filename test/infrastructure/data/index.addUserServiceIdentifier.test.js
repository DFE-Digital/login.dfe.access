jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid/v4');

const uuid = require('uuid/v4');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addUserServiceIdentifier } = require('./../../../src/infrastructure/data');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';
const key = 'key1';
const value = 'value1';

describe('When adding an identifier to a user service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should upsert the record', async () => {
     await addUserServiceIdentifier(uid, sid, oid, key, value);

    expect(repository.userServiceIdentifiers.upsert).toHaveBeenCalledTimes(1);
    expect(repository.userServiceIdentifiers.upsert.mock.calls[0][0]).toMatchObject({
      user_id: uid,
      organisation_id: oid,
      service_id: sid,
      identifier_key: key,
      identifier_value: value,
    });
  });
});