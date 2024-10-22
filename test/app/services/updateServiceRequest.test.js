jest.mock('./../../../src/infrastructure/logger', () => require('../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getUserServiceRequestEntity: jest.fn(),
  updateUserServiceRequest: jest.fn(),
}));

const { mockRequest, mockResponse } = require('../../utils');
const { getUserServiceRequestEntity, updateUserServiceRequest } = require('../../../src/infrastructure/data');
const updateServiceRequest = require('../../../src/app/services/updateServiceRequest');

const request = {
  "userId": "01A52B72-AE88-47BC-800B-E7DFFCE54344",
  "serviceId": "500DF403-4643-4CDE-9F30-3C6D8AD27AD7",
  "roles": "00C2DC79-ACFA-4206-A14A-9EF37DE34F21",
  "organisationId": "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
  "status": -1,
  "reason": "Request rejected by approver from service",
  "actionedBy": "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
  "actionedReason": "2023-06-29T11:31:18.265Z",
  "actionedAt": "2023-06-29T11:31:18.265Z",
  "createdAt": "2023-06-29T11:29:39.064Z",
  "updatedAt": "2023-06-29T11:31:18.285Z",
  "requestType": "service"
};

const res = mockResponse();

describe('When patching a user request', () => {
  let req;

  const id = 'f2a2d83f-843e-442d-9d3c-7d3d7d25cdd7';

  beforeEach(() => {
    getUserServiceRequestEntity.mockReset().mockReturnValue(request);
    updateUserServiceRequest.mockReset();
    req = mockRequest({
      params: {
        'id': id,
      },
      body: { 'status': 1 },
    });
    res.mockResetAll();
  });

  it('then it should return 202 response', async () => {
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it error when given an unsupported field', async () => {
    req = mockRequest({
      params: {
        id,
      },
      body: { 'status': 1, 'bad-field': 'blah' },
    });
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({"details": "Unpatchable property bad-field. Allowed properties status,actioned_by,actioned_reason,actioned_at"});
  });

  it('then it error when given no fields', async () => {
    req = mockRequest({
      params: {
        id,
      },
      body: {},
    });
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({"details": "Must specify at least one property. Patchable properties status,actioned_by,actioned_reason,actioned_at"});
  });

  it('should return 404 if the request is not found', async () => {
    getUserServiceRequestEntity.mockReset().mockReturnValue(null);
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('should be called with expected values if thigns are good', async () => {
    await updateServiceRequest(req, res);

    expect(updateUserServiceRequest).toHaveBeenCalledTimes(1);
    expect(updateUserServiceRequest).toHaveBeenCalledWith(request, req.body);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('should raise an exception if an exception is raised in getUserService', async () => {
    getUserServiceRequestEntity.mockImplementation(() => {
      throw new Error('bad times');
    });

    await expect(updateServiceRequest(req, res)).rejects.toThrow('bad times');
  });


});

  // it('then it should update name if included', async () => {
  //   req.body.name = 'policy one a';

  //   await updatePolicyOfService(req, res);

  //   expect(addPolicy).toHaveBeenCalledTimes(1);
  //   expect(addPolicy).toHaveBeenCalledWith(policy.id, 'policy one a', policy.applicationId, policy.status.id);
  // });

  // it('then it should update status if included', async () => {
  //   req.body.status = { id: 0 };

  //   await updatePolicyOfService(req, res);

  //   expect(addPolicy).toHaveBeenCalledTimes(1);
  //   expect(addPolicy).toHaveBeenCalledWith(policy.id, policy.name, policy.applicationId, 0);
  // });

  // it('then it should not update conditions if not included', async () => {
  //   await updatePolicyOfService(req, res);

  //   expect(deletePolicyConditions).toHaveBeenCalledTimes(0);
  //   expect(addPolicyCondition).toHaveBeenCalledTimes(0);
  // });

  // it('then it should delete all existing conditions and add new ones when included', async () => {
  //   req.body.conditions = [{
  //     field: 'id',
  //     operator: 'Is',
  //     value: ['123456'],
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(deletePolicyConditions).toHaveBeenCalledTimes(1);
  //   expect(deletePolicyConditions).toHaveBeenCalledWith(pid);
  //   expect(addPolicyCondition).toHaveBeenCalledTimes(1);
  //   expect(addPolicyCondition).toHaveBeenCalledWith('new-uuid-1', pid, req.body.conditions[0].field, req.body.conditions[0].operator, req.body.conditions[0].value[0]);
  // });

  // it('then it should not update roles if not included', async () => {
  //   await updatePolicyOfService(req, res);

  //   expect(deletePolicyRoles).toHaveBeenCalledTimes(0);
  //   expect(addPolicyRole).toHaveBeenCalledTimes(0);
  // });

  // it('then it should delete all existing roles and add new ones when included', async () => {
  //   req.body.roles = [{
  //     id: 'role1',
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(deletePolicyRoles).toHaveBeenCalledTimes(1);
  //   expect(deletePolicyRoles).toHaveBeenCalledWith(pid);
  //   expect(addPolicyRole).toHaveBeenCalledTimes(1);
  //   expect(addPolicyRole).toHaveBeenCalledWith(pid, req.body.roles[0].id);
  // });

  // it('then it should return 400 if conditions is not an array', async () => {
  //   req.body.conditions = 'not-an-array';

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions must be an array',
  //     ],
  //   });
  // });

  // it('then it should return 400 if conditions has no entries', async () => {
  //   req.body.conditions = [];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions must have at least one entry',
  //     ],
  //   });
  // });

  // it('then it should return 400 if conditions entry is missing field', async () => {
  //   req.body.conditions = [{
  //     field: undefined,
  //     operator: 'Is',
  //     value: ['123456'],
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions entries must have field',
  //     ],
  //   });
  // });

  // it('then it should return 400 if conditions entry is missing operator', async () => {
  //   req.body.conditions = [{
  //     field: 'id',
  //     operator: undefined,
  //     value: ['123456'],
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions entries must have operator',
  //     ],
  //   });
  // });

  // it('then it should return 400 if conditions entry is missing value', async () => {
  //   req.body.conditions = [{
  //     field: 'id',
  //     operator: 'Is',
  //     value: undefined,
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions entries must have value',
  //     ],
  //   });
  // });

  // it('then it should return 400 if conditions entry value is not an array', async () => {
  //   req.body.conditions = [{
  //     field: 'id',
  //     operator: 'Is',
  //     value: 'just-a-value',
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Conditions entries value must be an array',
  //     ],
  //   });
  // });

  // it('then it should return 400 if roles is not an array', async () => {
  //   req.body.roles = 'not-an-array';

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Roles must be an array',
  //     ],
  //   });
  // });

  // it('then it should return 400 if roles has no entries', async () => {
  //   req.body.roles = [];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Roles must have at least one entry',
  //     ],
  //   });
  // });

  // it('then it should return 400 if roles entry is missing id', async () => {
  //   req.body.roles = [{
  //     id: undefined,
  //   }];

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  //   expect(res.send).toHaveBeenCalledWith({
  //     errors: [
  //       'Roles entries must have id',
  //     ],
  //   });
  // });

  // it('then it should return 404 if policy not found', async () => {
  //   getPolicy.mockReturnValue(undefined);

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(404);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  // });

  // it('then it should return 404 if policy found but not for service', async () => {
  //   const policy1 = Object.assign({}, policy, { applicationId: 'different' });
  //   getPolicy.mockReturnValue(policy1);

  //   await updatePolicyOfService(req, res);

  //   expect(res.status).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(404);
  //   expect(res.send).toHaveBeenCalledTimes(1);
  // });
// });
