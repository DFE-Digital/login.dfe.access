jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
jest.mock('uuid/v4');

const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getUserOfServiceIdentifier } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const sid = 'service-1';
const key = 'key1';
const value = 'value1';

describe('When adding an identifier to a user service in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServiceIdentifiers.findOne.mockReturnValue({
      user_id: 'user-1',
    });
  });

  it('then it should upsert the record', async () => {
    await getUserOfServiceIdentifier(sid, key, value);

    expect(repository.userServiceIdentifiers.findOne).toHaveBeenCalledTimes(1);
    expect(repository.userServiceIdentifiers.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        service_id: {
          [Op.eq]: sid,
        },
        identifier_key: {
          [Op.eq]: key,
        },
        identifier_value: {
          [Op.eq]: value,
        },
      },
    });
  });

  it('then it should return user_id if result found', async () => {
    const actual = await getUserOfServiceIdentifier(sid, key, value);

    expect(actual).toBe('user-1');
  });

  it('then it should return undefined if no result found', async () => {
    repository.userServiceIdentifiers.findOne.mockReturnValue(undefined);

    const actual = await getUserOfServiceIdentifier(sid, key, value);

    expect(actual).toBeUndefined();
  });
});