jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockUserServiceEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getUserServices } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const services = [
  mockUserServiceEntity({}),
  mockUserServiceEntity({}, [{ identifier_key: 'k2s-id', identifier_value: '123456' }]),
  mockUserServiceEntity({}, [{ identifier_key: 'groups', identifier_value: 'g1,g2' }]),
];

describe('When getting user services from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServices.findAll.mockReturnValue(services);

    services[0].mockResetAll();
    services[1].mockResetAll();
    services[2].mockResetAll();
  });

  it('then it should find all for user_id', async () => {
    await getUserServices(uid);

    expect(repository.userServices.findAll).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findAll.mock.calls[0][0]).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
        },
      },
    });
  });

  it('then it should order results by service id, then organisation id', async () => {
    await getUserServices(uid);

    expect(repository.userServices.findAll).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findAll.mock.calls[0][0]).toMatchObject({
      order: ['service_id', 'organisation_id'],
    });
  });

  it('then it should return services mapped to model', async () => {
    const actual = await getUserServices(uid);

    expect(actual.length).toBe(3);
    expect(actual[0]).toEqual({
      serviceId: services[0].service_id,
      organisationId: services[0].organisation_id,
      roles: [],
      identifiers: [],
      accessGrantedOn: services[0].createdAt,
    });
    expect(actual[1]).toEqual({
      serviceId: services[1].service_id,
      organisationId: services[1].organisation_id,
      roles: [],
      identifiers: [{ key: 'k2s-id', value: '123456' }],
      accessGrantedOn: services[1].createdAt,
    });
    expect(actual[2]).toEqual({
      serviceId: services[2].service_id,
      organisationId: services[2].organisation_id,
      roles: ['g1', 'g2'],
      identifiers: [{ key: 'groups', value: 'g1,g2' }],
      accessGrantedOn: services[2].createdAt,
    });
  })
});
