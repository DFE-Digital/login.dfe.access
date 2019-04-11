jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getPoliciesForService: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getPoliciesForService } = require('./../../../src/infrastructure/data');
const listPoliciesOfService = require('./../../../src/app/services/listPoliciesOfService');

const policies = [
  {
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
  }
];
const sid = 'service1';
const res = mockResponse();

describe('When listing policies of a service', () => {
  let req;

  beforeEach(() => {
    getPoliciesForService.mockReset().mockReturnValue(policies);

    req = mockRequest({
      params: {
        sid,
      }
    });
    res.mockResetAll();
  });

  it('then it should query for policies with service id', async () => {
    await listPoliciesOfService(req, res);

    expect(getPoliciesForService).toHaveBeenCalledTimes(1);
    expect(getPoliciesForService).toHaveBeenCalledWith(sid, 1, 100000);
  });

  it('then it should return json policies', async () => {
    await listPoliciesOfService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(policies);
  });
});
