jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockPolicyEntity, mockRoleEntity, mockPolicyConditionEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getPoliciesForService } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const sid = 'service-1';
const policies = {
  rows: [
    mockPolicyEntity(),
    mockPolicyEntity({
      roles: [mockRoleEntity(), mockRoleEntity()],
      conditions: [mockPolicyConditionEntity({ field: 'id' }), mockPolicyConditionEntity({ field: 'organisation.id' }), mockPolicyConditionEntity({ field: 'id' })],
    }),
  ]
};

describe('When getting policies for service from the repository', () => {
  beforeEach(() => {
    repository.policies.mockResetAll();

    repository.policies.findAndCountAll.mockReturnValue(policies);

});

  it('then it should find all for applicationId', async () => {
    await getPoliciesForService(sid, 1, 50);

    expect(repository.policies.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(repository.policies.findAndCountAll.mock.calls[0][0]).toMatchObject({
      where: {
        applicationId: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it('then it should order results by policy name', async () => {
    await getPoliciesForService(sid, 1, 50);

    expect(repository.policies.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(repository.policies.findAndCountAll.mock.calls[0][0]).toMatchObject({
      order: ['name'],
    });
  });

  it('then it should return policies mapped to model', async () => {
    const actual = await getPoliciesForService(sid, 1, 50);

    expect(actual.policies.length).toBe(2);
    expect(actual.policies[0]).toEqual({
      id: policies.rows[0].id,
      name: policies.rows[0].name,
      applicationId: policies.rows[0].applicationId,
      status: {
        id: policies.rows[0].status,
      },
      conditions: [],
      roles: [],
    });
    expect(actual.policies[1]).toEqual({
      id: policies.rows[1].id,
      name: policies.rows[1].name,
      applicationId: policies.rows[1].applicationId,
      status: {
        id: policies.rows[1].status,
      },
      conditions: [
        {
          field: policies.rows[1].conditions[0].field,
          operator: policies.rows[1].conditions[0].operator,
          value: [policies.rows[1].conditions[0].value, policies.rows[1].conditions[2].value],
        },
        {
          field: policies.rows[1].conditions[1].field,
          operator: policies.rows[1].conditions[1].operator,
          value: [policies.rows[1].conditions[1].value],
        },
      ],
      roles: [
        {
          id: policies.rows[1].roles[0].id,
          name: policies.rows[1].roles[0].name,
          status: {
            id: policies.rows[1].roles[0].status,
          },
        },
        {
          id: policies.rows[1].roles[1].id,
          name: policies.rows[1].roles[1].name,
          status: {
            id: policies.rows[1].roles[1].status,
          },
        }
      ],
    });
  });
});
