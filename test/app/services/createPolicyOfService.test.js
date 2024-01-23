jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addPolicy: jest.fn(),
  addPolicyCondition: jest.fn(),
  addPolicyRole: jest.fn(),
}));
jest.mock('uuid');

const { mockRequest, mockResponse } = require('./../../utils');
const { addPolicy, addPolicyCondition, addPolicyRole } = require('./../../../src/infrastructure/data');
const uuid = require('uuid');
const createPolicyOfService = require('./../../../src/app/services/createPolicyOfService');

const sid = 'service1';
const res = mockResponse();

describe('When listing policies of a service', () => {
  let req;
  let uuidCounter;

  beforeEach(() => {
    addPolicy.mockReset();
    addPolicyCondition.mockReset();
    addPolicyRole.mockReset();

    uuidCounter = 0;
    uuid.v4.mockReset().mockImplementation(() => {
      uuidCounter++;
      return `new-uuid-${uuidCounter}`;
    });

    req = mockRequest({
      params: {
        sid,
      },
      body: {
        name: 'Policy 1',
        conditions: [
          {
            field: 'id',
            operator: 'Is',
            value: ['123456'],
          },
        ],
        roles: [
          {
            id: 'role1',
          }
        ],
      },
    });
    res.mockResetAll();
  });

  it('then it should return 201 result', async () => {
    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ id: 'new-uuid-1' });
  });

  it('then it should include location of resource', async () => {
    await createPolicyOfService(req, res);

    expect(res.set).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith('Location', `/services/${sid}/policies/new-uuid-1`);
  });

  it('then it should create policy', async () => {
    await createPolicyOfService(req, res);

    expect(addPolicy).toHaveBeenCalledTimes(1);
    expect(addPolicy).toHaveBeenCalledWith('new-uuid-1', 'Policy 1', sid, 1);
  });

  it('then it should create condition', async () => {
    await createPolicyOfService(req, res);

    expect(addPolicyCondition).toHaveBeenCalledTimes(1);
    expect(addPolicyCondition).toHaveBeenCalledWith('new-uuid-2', 'new-uuid-1', 'id', 'Is', '123456');
  });

  it('then it should create role', async () => {
    await createPolicyOfService(req, res);

    expect(addPolicyRole).toHaveBeenCalledTimes(1);
    expect(addPolicyRole).toHaveBeenCalledWith('new-uuid-1', 'role1');
  });

  it('then it should return 400 if name is not specified', async () => {
    req.body.name = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Name must be specified',
      ],
    });
  });

  it('then it should return 400 if conditions is not specified', async () => {
    req.body.conditions = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions must be specified',
      ],
    });
  });

  it('then it should return 400 if conditions is not an array', async () => {
    req.body.conditions = 'not-an-array';

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions must be an array',
      ],
    });
  });

  it('then it should return 400 if conditions has no entries', async () => {
    req.body.conditions = [];

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions must have at least one entry',
      ],
    });
  });

  it('then it should return 400 if conditions entry is missing field', async () => {
    req.body.conditions[0].field = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions entries must have field',
      ],
    });
  });

  it('then it should return 400 if conditions entry is missing operator', async () => {
    req.body.conditions[0].operator = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions entries must have operator',
      ],
    });
  });

  it('then it should return 400 if conditions entry is missing value', async () => {
    req.body.conditions[0].value = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions entries must have value',
      ],
    });
  });

  it('then it should return 400 if conditions entry value is not an array', async () => {
    req.body.conditions[0].value = 'just-a-value';

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Conditions entries value must be an array',
      ],
    });
  });

  it('then it should return 400 if roles is not specified', async () => {
    req.body.roles = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Roles must be specified',
      ],
    });
  });

  it('then it should return 400 if roles is not an array', async () => {
    req.body.roles = 'not-an-array';

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Roles must be an array',
      ],
    });
  });

  it('then it should return 400 if roles has no entries', async () => {
    req.body.roles = [];

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Roles must have at least one entry',
      ],
    });
  });

  it('then it should return 400 if roles entry is missing id', async () => {
    req.body.roles[0].id = undefined;

    await createPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        'Roles entries must have id',
      ],
    });
  });
});