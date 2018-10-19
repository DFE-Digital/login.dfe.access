jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockRoleEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getServiceRoles } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const sid = 'service-1';
const roles = [mockRoleEntity(), mockRoleEntity()];

describe('When getting roles of service from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.roles.findAll.mockReturnValue(roles);

    roles[0].mockResetAll();
    roles[1].mockResetAll();
  });

  it('then it should find for id', async () => {
    await getServiceRoles(sid);

    expect(repository.roles.findAll).toHaveBeenCalledTimes(1);
    expect(repository.roles.findAll.mock.calls[0][0]).toMatchObject({
      where: {
        applicationId: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it('then it should return roles mapped to model', async () => {
    const actual = await getServiceRoles(sid);

    expect(actual).toEqual([
      {
        id: roles[0].id,
        name: roles[0].name,
        status: {
          id: roles[0].status,
        },
      },
      {
        id: roles[1].id,
        name: roles[1].name,
        status: {
          id: roles[1].status,
        },
      }
    ]);
  });

  it('then it should return empty array if no records found', async () => {
    repository.roles.findAll.mockReturnValue(undefined);

    const actual = await getServiceRoles(sid);

    expect(actual).toEqual([]);
  });
});
