jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockPolicyEntity, mockRoleEntity, mockPolicyConditionEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getPoliciesForService } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const sid = 'service-1';
const policies = [
  mockPolicyEntity(),
  mockPolicyEntity({
    roles: [mockRoleEntity(), mockRoleEntity()],
    conditions: [mockPolicyConditionEntity({ field: 'id' }), mockPolicyConditionEntity({ field: 'organisation.id' }), mockPolicyConditionEntity({ field: 'id' })],
  }),
];

describe('When getting policies for service from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.policies.findAll.mockReturnValue(policies);

    policies[0].mockResetAll();
    policies[1].mockResetAll();
  });

  it('then it should find all for applicationId', async () => {
    await getPoliciesForService(sid);

    expect(repository.policies.findAll).toHaveBeenCalledTimes(1);
    expect(repository.policies.findAll.mock.calls[0][0]).toMatchObject({
      where: {
        applicationId: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it('then it should order results by policy name', async () => {
    await getPoliciesForService(sid);

    expect(repository.policies.findAll).toHaveBeenCalledTimes(1);
    expect(repository.policies.findAll.mock.calls[0][0]).toMatchObject({
      order: ['name'],
    });
  });

  it('then it should return policies mapped to model', async () => {
    const actual = await getPoliciesForService(sid);

    expect(actual.length).toBe(2);
    expect(actual[0]).toEqual({
      id: policies[0].id,
      name: policies[0].name,
      applicationId: policies[0].applicationId,
      status: {
        id: policies[0].status,
      },
      conditions: [],
      roles: [],
    });
    expect(actual[1]).toEqual({
      id: policies[1].id,
      name: policies[1].name,
      applicationId: policies[1].applicationId,
      status: {
        id: policies[1].status,
      },
      conditions: [
        {
          field: policies[1].conditions[0].field,
          operator: policies[1].conditions[0].operator,
          value: [policies[1].conditions[0].value, policies[1].conditions[2].value],
        },
        {
          field: policies[1].conditions[1].field,
          operator: policies[1].conditions[1].operator,
          value: [policies[1].conditions[1].value],
        },
      ],
      roles: [
        {
          id: policies[1].roles[0].id,
          name: policies[1].roles[0].name,
          status: {
            id: policies[1].roles[0].status,
          },
        },
        {
          id: policies[1].roles[1].id,
          name: policies[1].roles[1].name,
          status: {
            id: policies[1].roles[1].status,
          },
        }
      ],
    });
  });
});
