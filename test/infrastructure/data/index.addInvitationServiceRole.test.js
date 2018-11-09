jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid/v4');

const uuid = require('uuid/v4');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addInvitationServiceRole } = require('./../../../src/infrastructure/data');

const iid = 'invitation-1';
const sid = 'service-1';
const oid = 'organisation-1';
const rid = 'role1';

describe('When adding a role to a invitation service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should create the record', async () => {
     await addInvitationServiceRole(iid, sid, oid, rid);

    expect(repository.invitationServiceRoles.create).toHaveBeenCalledTimes(1);
    expect(repository.invitationServiceRoles.create.mock.calls[0][0]).toMatchObject({
      id: 'new-uuid',
      invitation_id: iid,
      organisation_id: oid,
      service_id: sid,
      role_id: rid,
    });
  });
});