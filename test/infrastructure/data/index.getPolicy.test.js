jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockPolicyEntity, mockRoleEntity, mockPolicyConditionEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getPolicy } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const id = 'policy-1';
const policy = mockPolicyEntity({
  roles: [mockRoleEntity(), mockRoleEntity()],
  conditions: [mockPolicyConditionEntity(), mockPolicyConditionEntity()],
});

describe('When getting policy from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.policies.find.mockReturnValue(policy);

    policy.mockResetAll();
  });

  it('then it should find for id', async () => {
    await getPolicy(id);

    expect(repository.policies.find).toHaveBeenCalledTimes(1);
    expect(repository.policies.find.mock.calls[0][0]).toMatchObject({
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    });
  });

  it('then it should return policy mapped to model', async () => {
    const actual = await getPolicy(id);

    expect(actual).toEqual({
      id: policy.id,
      name: policy.name,
      applicationId: policy.applicationId,
      status: {
        id: policy.status,
      },
      conditions: [
        {
          field: policy.conditions[0].field,
          operator: policy.conditions[0].operator,
          value: policy.conditions[0].value,
        },
        {
          field: policy.conditions[1].field,
          operator: policy.conditions[1].operator,
          value: policy.conditions[1].value,
        },
      ],
      roles: [
        {
          id: policy.roles[0].id,
          name: policy.roles[0].name,
          status: {
            id: policy.roles[0].status,
          },
        },
        {
          id: policy.roles[1].id,
          name: policy.roles[1].name,
          status: {
            id: policy.roles[1].status,
          },
        }
      ],
    });
  });

  it('then it should return undefined if no record found', async () => {
    repository.policies.find.mockReturnValue(undefined);

    const actual = await getPolicy(id);

    expect(actual).toBeUndefined();
  })
});
