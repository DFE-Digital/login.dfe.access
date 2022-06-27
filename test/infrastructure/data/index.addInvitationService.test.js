jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid/v4');
const uuid = require('uuid/v4');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addInvitationService } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const iid = 'invitation-1';
const sid = 'service-1';
const oid = 'organisation-1';

describe('When adding invitation to service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.mockReset().mockReturnValue('new-uuid');
  });

  it('and record exists then it should return existing id and not create new record', async () => {
    repository.invitationServices.findOne.mockReturnValue({ id: '123456' });

    const actual = await addInvitationService(iid, sid, oid);

    expect(actual).toEqual('123456');
    expect(repository.invitationServices.findOne).toHaveBeenCalledTimes(1);
    expect(repository.invitationServices.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        invitation_id: {
          [Op.eq]: iid,
        },
        service_id: {
          [Op.eq]: sid,
        },
        organisation_id: {
          [Op.eq]: oid,
        },
      },
    });
  });

  it('and record does not exist then it should create new record and return its id', async () => {
    repository.invitationServices.findOne.mockReturnValue(undefined);

    const actual = await addInvitationService(iid, sid, oid);

    expect(actual).toEqual('new-uuid');
    expect(repository.invitationServices.create).toHaveBeenCalledTimes(1);
    expect(repository.invitationServices.create.mock.calls[0][0]).toMatchObject({
      id: 'new-uuid',
      invitation_id: iid,
      organisation_id: oid,
      service_id: sid,
    });
  });
});
