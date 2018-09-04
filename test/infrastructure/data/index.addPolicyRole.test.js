jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { addPolicyRole } = require('./../../../src/infrastructure/data');

const pid = 'policy-1';
const rid = 'role-1';

describe('When adding role to policy in repository', () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it('then it should upsert record', async () => {
    await addPolicyRole(pid, rid);

    expect(repository.policyRoles.upsert).toHaveBeenCalledTimes(1);
    expect(repository.policyRoles.upsert.mock.calls[0][0]).toMatchObject({
      policyId: pid,
      roleId: rid,
    });
  });
});
