jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid');

const uuid = require('uuid');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';

describe('When adding an identifier to a user service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.v4.mockReset().mockReturnValue('new-uuid');
  });

  it('then it should upsert the record', async () => {
    await removeAllUserServiceIdentifiers(uid, sid, oid);

    expect(repository.userServiceIdentifiers.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServiceIdentifiers.destroy.mock.calls[0][0]).toMatchObject({
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