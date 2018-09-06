jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { deletePolicyConditions } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const pid = 'policy-1';

describe('When deleting policy conditions in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it('then it should delete records based on policyId', async () => {
    await deletePolicyConditions(pid);

    expect(repository.policyConditions.destroy).toHaveBeenCalledTimes(1);
    expect(repository.policyConditions.destroy.mock.calls[0][0]).toMatchObject({
      where: {
        policyId: {
          [Op.eq]: pid,
        },
      },
    });
  });
});
