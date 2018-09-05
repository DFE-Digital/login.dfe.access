jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { deletePolicyRoles } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const pid = 'policy-1';

describe('When deleting policy roles in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it('then it should delete records based on policyId', async () => {
    await deletePolicyRoles(pid);

    expect(repository.policyRoles.destroy).toHaveBeenCalledTimes(1);
    expect(repository.policyRoles.destroy.mock.calls[0][0]).toMatchObject({
      where: {
        policyId: {
          [Op.eq]: pid,
        },
      },
    });
  });
});
