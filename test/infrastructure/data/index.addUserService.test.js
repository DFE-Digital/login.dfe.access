jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid');

const uuid = require('uuid');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');

const { addUserService } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';

describe('When adding user to service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();
    uuid.v4.mockReset().mockReturnValue('new-uuid');
  });

  it('and record exists then it should return existing id and not create new record', async () => {
    repository.userServices.findOne.mockReturnValue({ id: '123456' });

    const actual = await addUserService(uid, sid, oid);

    expect(actual).toEqual('123456');
    expect(repository.userServices.findOne).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
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
    repository.userServices.findOne.mockReturnValue(undefined);

    const actual = await addUserService(uid, sid, oid);

    expect(actual).toEqual('new-uuid');
    expect(repository.userServices.create).toHaveBeenCalledTimes(1);
    expect(repository.userServices.create.mock.calls[0][0]).toMatchObject({
      id: 'new-uuid',
      status: 1,
      user_id: uid,
      organisation_id: oid,
      service_id: sid,
    });
  });
});
