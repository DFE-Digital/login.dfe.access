jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid');

const uuid = require('uuid');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addInvitationServiceIdentifier } = require('./../../../src/infrastructure/data');

const iid = 'invitation-1';
const sid = 'service-1';
const oid = 'organisation-1';
const key = 'key1';
const value = 'value1';

describe('When adding an identifier to a invitation service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.v4.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should upsert the record', async () => {
     await addInvitationServiceIdentifier(iid, sid, oid, key, value);

    expect(repository.invitationServiceIdentifiers.upsert).toHaveBeenCalledTimes(1);
    expect(repository.invitationServiceIdentifiers.upsert.mock.calls[0][0]).toMatchObject({
      invitation_id: iid,
      organisation_id: oid,
      service_id: sid,
      identifier_key: key,
      identifier_value: value,
    });
  });
});