jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/config', () => require('./../../utils').mockConfig());
jest.mock('./../../../src/infrastructure/data', () => ({
  addUserService: jest.fn(),
  addUserServiceIdentifier: jest.fn(),
  removeAllUserServiceIdentifiers: jest.fn(),
  getServiceRoles: jest.fn(),
  removeAllUserServiceRoles: jest.fn(),
  addUserServiceRole: jest.fn(),
}));
jest.mock('./../../../src/infrastructure/notifications');

const { mockRequest, mockResponse } = require('./../../utils');
const { notifyUserUpdated } = require('./../../../src/infrastructure/notifications');
const { addUserService, addUserServiceIdentifier, removeAllUserServiceIdentifiers, getServiceRoles, removeAllUserServiceRoles, addUserServiceRole } = require('./../../../src/infrastructure/data');
const addServiceToUser = require('./../../../src/app/users/addServiceToUser');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When adding service to user', () => {
  let req;

  beforeEach(() => {
    notifyUserUpdated.mockReset();

    addUserService.mockReset().mockReturnValue('mapping-id');
    addUserServiceIdentifier.mockReset();
    removeAllUserServiceIdentifiers.mockReset();
    getServiceRoles.mockReset().mockReturnValue([
      { id: 'role1' },
      { id: 'role3' },
    ]);
    removeAllUserServiceRoles.mockReset();
    addUserServiceRole.mockReset();

    req = mockRequest({
      params: {
        uid,
        sid,
        oid,
      },
      body: {
        identifiers: [
          { key: 'some', value: 'thing' },
          { key: 'something', value: 'else' },
        ],
        roles: [
          'role1',
          'role3',
        ],
      },
    });
    res.mockResetAll();
  });

  it('then it should add mapping', async () => {
    await addServiceToUser(req, res);

    expect(addUserService).toHaveBeenCalledTimes(1);
    expect(addUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should remove existing identifiers if new identifiers specified', async () => {
    await addServiceToUser(req, res);

    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should remove existing identifiers if new identifiers not specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToUser(req, res);

    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should add identifiers if specified', async () => {
    await addServiceToUser(req, res);

    expect(addUserServiceIdentifier).toHaveBeenCalledTimes(2);
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(uid, sid, oid, 'some', 'thing');
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(uid, sid, oid, 'something', 'else');
  });

  it('then it should not attempt to add identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToUser(req, res);

    expect(addUserServiceIdentifier).not.toHaveBeenCalled();
  });

  it('then it should remove existing roles if new roles specified', async () => {
    await addServiceToUser(req, res);

    expect(removeAllUserServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceRoles).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should remove existing roles if new roles not specified', async () => {
    req.body.roles = undefined;

    await addServiceToUser(req, res);

    expect(removeAllUserServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceRoles).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should add roles if specified', async () => {
    await addServiceToUser(req, res);

    expect(addUserServiceRole).toHaveBeenCalledTimes(2);
    expect(addUserServiceRole).toHaveBeenCalledWith(uid, sid, oid, 'role1');
    expect(addUserServiceRole).toHaveBeenCalledWith(uid, sid, oid, 'role3');
  });

  it('then it should not attempt to add roles if none specified', async () => {
    req.body.roles = undefined;

    await addServiceToUser(req, res);

    expect(addUserServiceRole).not.toHaveBeenCalled();
  });

  it('then it should return 202 response', async () => {
    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 if identifiers specified but not array', async () => {
    req.body.identifiers = 'not-an-array';

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Identifiers must be an array',
      ],
    });
  });

  it('then it should return 400 if identifiers specified and items does not have key', async () => {
    req.body.identifiers = [{ value: 'thing' }];

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Identifiers items must contain key and value',
      ],
    });
  });

  it('then it should return 400 if identifiers specified and items does not have value', async () => {
    req.body.identifiers = [{ key: 'some' }];

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Identifiers items must contain key and value',
      ],
    });
  });

  it('then it should return 400 if roles specified but not array', async () => {
    req.body.roles = 'not-an-array';

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Roles must be an array',
      ],
    });
  });

  it('then it should return 400 if role not valid for service', async () => {
    req.body.roles = ['role2'];

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Role role2 is not available for service service1',
      ],
    });
  });

  it('then it should send notification of user update', async () => {
    await addServiceToUser(req, res);

    expect(notifyUserUpdated).toHaveBeenCalledTimes(1);
    expect(notifyUserUpdated).toHaveBeenCalledWith(uid);
  });

  it('should raise an exception if an exception is raised when adding a user service', async () => {
    addUserService.mockImplementation(() => {
      throw new Error('bad times');
    });

    await expect(addServiceToUser(req, res)).rejects.toThrow('bad times');
  });
});
