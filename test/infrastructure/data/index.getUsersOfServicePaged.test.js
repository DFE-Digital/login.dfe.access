jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockUserServiceEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getUsersOfServicePaged } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const sid = 'service-1';
const filters = undefined;
const pageNumber = 2;
const pageSize = 25;
const services = [
  mockUserServiceEntity({}),
  mockUserServiceEntity({}, [{ identifier_key: 'k2s-id', identifier_value: '123456' }]),
  mockUserServiceEntity({}, [{ identifier_key: 'groups', identifier_value: 'g1,g2' }]),
];

// TODO: This is not super testable until we can update schema to allow sequelize relationships
describe.skip('When getting a page of users with access to service from repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServices.findAndCountAll.mockReturnValue({
      rows: services,
      count: 52,
    });

    services[0].mockResetAll();
    services[1].mockResetAll();
    services[2].mockResetAll();
  });

  it('then it should query by service id', async () => {
    await getUsersOfServicePaged(sid, filters, pageNumber, pageSize);

    expect(repository.userServices.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findAndCountAll.mock.calls[0][0]).toMatchObject({
      where: {
        service_id: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it('then it should query with pagination', async () => {
    await getUsersOfServicePaged(sid, filters, pageNumber, pageSize);

    expect(repository.userServices.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findAndCountAll.mock.calls[0][0]).toMatchObject({
      offset: 25,
      limit: pageSize,
    });
  });

  it('then it should return services mapped to model', async () => {
    const actual = await getUsersOfServicePaged(sid, filters, pageNumber, pageSize);

    expect(actual.services.length).toBe(3);
    expect(actual.services[0]).toEqual({
      serviceId: services[0].service_id,
      organisationId: services[0].organisation_id,
      roles: [],
      identifiers: [],
      accessGrantedOn: services[0].createdAt,
    });
    expect(actual.services[1]).toEqual({
      serviceId: services[1].service_id,
      organisationId: services[1].organisation_id,
      roles: [],
      identifiers: [{ key: 'k2s-id', value: '123456' }],
      accessGrantedOn: services[1].createdAt,
    });
    expect(actual.services[2]).toEqual({
      serviceId: services[2].service_id,
      organisationId: services[2].organisation_id,
      roles: ['g1', 'g2'],
      identifiers: [{ key: 'groups', value: 'g1,g2' }],
      accessGrantedOn: services[2].createdAt,
    });
  });

  it('then it should return pagination information', async () => {
    const actual = await getUsersOfServicePaged(sid, filters, pageNumber, pageSize);

    expect(actual.page).toBe(pageNumber);
    expect(actual.totalNumberOfPages).toBe(3);
    expect(actual.totalNumberOfRecords).toBe(52);
  });
});
