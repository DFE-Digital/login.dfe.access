jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockUserServiceRequestEntity } = require('./mockOrganisationsRepository');
const repository = require('../../../src/infrastructure/data/organisationsRepository');
const { getUserServiceRequests } = require('../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const serviceRequests = [
  mockUserServiceRequestEntity({}, 1),
  mockUserServiceRequestEntity({}, -1),
];

describe('When getting user services from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServiceRequests.findAll.mockReturnValue(serviceRequests);

    serviceRequests[0].mockResetAll();
    serviceRequests[1].mockResetAll();
  });

  it('then it should find all for user_id', async () => {
    await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRequests.findAll.mock.calls[0][0]).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
        },
      },
    });
  });

  it('then it should order results by service id, then organisation id', async () => {
    await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRequests.findAll.mock.calls[0][0]).toMatchObject({
      order: ['service_id', 'organisation_id'],
    });
  });

  it('should return undefined after mapping if no results', async () => {
    repository.userServiceRequests.findAll.mockReturnValue(undefined);
    const result = await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRequests.findAll.mock.calls[0][0]).toMatchObject({
      order: ['service_id', 'organisation_id'],
    });
    expect(result).toBe(undefined);
  });

  it('then it should return services mapped to model', async () => {
    const actual = await getUserServiceRequests(uid);

    expect(actual.length).toBe(2);
    expect(actual[0]).toEqual({
      userId: serviceRequests[0].user_id,
      serviceId: serviceRequests[0].service_id,
      organisationId: serviceRequests[0].organisation_id,
      roles: serviceRequests[0].role_ids,
      status: serviceRequests[0].status,
      reason: serviceRequests[0].reason,
      actionedBy: serviceRequests[0].actioned_by,
      actionedReason: serviceRequests[0].actioned_reason,
      actionedAt: serviceRequests[0].actioned_at,
      createdAt: serviceRequests[0].createdAt,
      updatedAt: serviceRequests[0].updatedAt,
      requestType: serviceRequests[0].request_type,
    });
    expect(actual[1]).toEqual({
      userId: serviceRequests[1].user_id,
      serviceId: serviceRequests[1].service_id,
      organisationId: serviceRequests[1].organisation_id,
      roles: serviceRequests[1].role_ids,
      status: serviceRequests[1].status,
      reason: serviceRequests[1].reason,
      actionedBy: serviceRequests[1].actioned_by,
      actionedReason: serviceRequests[1].actioned_reason,
      actionedAt: serviceRequests[1].actioned_at,
      createdAt: serviceRequests[1].createdAt,
      updatedAt: serviceRequests[1].updatedAt,
      requestType: serviceRequests[1].request_type,
    });
  });
});
