jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid');

const uuid = require('uuid');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { removeAllUserServiceRequests } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';

describe('When removing service requests from a user for a given service in the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.v4.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should destroy all records for user/service/org', async () => {
    await removeAllUserServiceRequests(uid, sid, oid);

    expect(repository.userServiceRequests.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRequests.destroy.mock.calls[0][0]).toMatchObject({
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
});