jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getPolicy: jest.fn(),
  deletePolicy: jest.fn(),
  deletePolicyConditions: jest.fn(),
  deletePolicyRoles: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getPolicy, deletePolicy, deletePolicyConditions, deletePolicyRoles } = require('./../../../src/infrastructure/data');
const deletePolicyOfService = require('./../../../src/app/services/deletePolicyOfService');

const policy = {
  id: 'policy1',
  name: 'Policy one',
  applicationId: 'application1',
  status: {
    id: 1,
  },
  conditions: [
    {
      field: 'id',
      operator: 'Is',
      value: 'user1',
    },
  ],
  roles: [
    {
      id: 'role1',
      name: 'Role one',
      status: {
        id: 1,
      },
    }
  ]
};
const sid = policy.applicationId;
const pid = policy.id;
const res = mockResponse();

describe('When deleting a policy of a service', () => {
  let req;

  beforeEach(() => {
    getPolicy.mockReset().mockReturnValue(policy);
    deletePolicy.mockReset();
    deletePolicyConditions.mockReset();
    deletePolicyRoles.mockReset();

    req = mockRequest({
      params: {
        sid,
        pid,
      },
    });
    res.mockResetAll();
  });

  it('then it should return 204 response', async () => {
    await deletePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should delete conditions of policy', async () => {
    await deletePolicyOfService(req, res);

    expect(deletePolicyConditions).toHaveBeenCalledTimes(1);
    expect(deletePolicyConditions).toHaveBeenCalledWith(pid);
  });

  it('then it should delete roles of policy', async () => {
    await deletePolicyOfService(req, res);

    expect(deletePolicyRoles).toHaveBeenCalledTimes(1);
    expect(deletePolicyRoles).toHaveBeenCalledWith(pid);
  });

  it('then it should delete policy', async () => {
    await deletePolicyOfService(req, res);

    expect(deletePolicy).toHaveBeenCalledTimes(1);
    expect(deletePolicy).toHaveBeenCalledWith(pid);
  });

  it('then it should return 404 if policy not found', async () => {
    getPolicy.mockReturnValue(undefined);

    await deletePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 404 if policy found but not for service', async () => {
    const policy1 = Object.assign({}, policy, { applicationId: 'different' });
    getPolicy.mockReturnValue(policy1);

    await deletePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
