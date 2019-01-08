jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/config', () => require('./../../utils').mockConfig({toggles: {notificationsEnabled: true}}));
jest.mock('./../../../src/infrastructure/data', () => ({
  getUserService: jest.fn(),
  addUserServiceIdentifier: jest.fn(),
  removeAllUserServiceIdentifiers: jest.fn(),
  removeAllUserServiceGroupIdentifiers: jest.fn(),
  addGroupsToUserServiceIdentifier: jest.fn(),
  getServiceRoles: jest.fn(),
  removeAllUserServiceRoles: jest.fn(),
  addUserServiceRole: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { removeAllUserServiceGroupIdentifiers, getUserService, addUserServiceIdentifier, removeAllUserServiceIdentifiers, getServiceRoles, removeAllUserServiceRoles, addUserServiceRole } = require('./../../../src/infrastructure/data');
const updateUserService = require('./../../../src/app/users/updateUserService');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When updating service of user', () => {
  let req;

  beforeEach(() => {
    getUserService.mockReset().mockReturnValue({
      userId: uid,
      serviceId: sid,
      organisationId: oid,
      roles: [
        { id: 'existing-role' },
      ],
      identifiers: [
        { key: 'existing', value: 'identifier' },
      ],
    });
    addUserServiceIdentifier.mockReset();
    removeAllUserServiceIdentifiers.mockReset();
    removeAllUserServiceGroupIdentifiers.mockReset();
    getServiceRoles.mockReset().mockReturnValue([
      { id: 'role1', },
      { id: 'role3' },
    ]);
    removeAllUserServiceRoles.mockReset();
    addUserServiceRole.mockReset();
    getServiceRoles.mockReset().mockReturnValue([
      { id: 'role1', code: 'role1'},
      { id: 'role3', code: 'role2'},
    ]);

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

  it('then it should get current user service', async () => {
    await updateUserService(req, res);

    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should return 404 if no mapping already exists for user/service/org', async () => {
    getUserService.mockReturnValue(undefined);

    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should remove existing identifiers if new identifiers specified', async () => {
    await updateUserService(req, res);

    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should add identifiers if specified', async () => {
    await updateUserService(req, res);

    expect(addUserServiceIdentifier).toHaveBeenCalledTimes(2);
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(uid, sid, oid, 'some', 'thing');
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(uid, sid, oid, 'something', 'else');
  });

  it('then it should not attempt to remove or add identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await updateUserService(req, res);

    expect(removeAllUserServiceIdentifiers).not.toHaveBeenCalled();
    expect(addUserServiceIdentifier).not.toHaveBeenCalled();
  });

  it('then it should remove identifiers if empty array', async () => {
    req.body.identifiers = [];

    await updateUserService(req, res);

    expect(removeAllUserServiceIdentifiers).toHaveBeenCalled();
  });

  it('then it should remove existing roles if new roles specified', async () => {
    await updateUserService(req, res);

    expect(removeAllUserServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceRoles).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should add roles if specified', async () => {
    await updateUserService(req, res);

    expect(addUserServiceRole).toHaveBeenCalledTimes(2);
    expect(addUserServiceRole).toHaveBeenCalledWith(uid, sid, oid, 'role1');
    expect(addUserServiceRole).toHaveBeenCalledWith(uid, sid, oid, 'role3');
  });

  it('then it should not attempt to remove or add roles if none specified', async () => {
    req.body.roles = undefined;

    await updateUserService(req, res);
    expect(removeAllUserServiceRoles).not.toHaveBeenCalled();
    expect(addUserServiceRole).not.toHaveBeenCalled();
  });

  it('then it should remove roles if empty array', async () => {
    req.body.roles = [];

    await updateUserService(req, res);

    expect(removeAllUserServiceRoles).toHaveBeenCalled();
  });

  it('then it should return 202 response', async () => {
    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 if identifiers specified but not array', async () => {
    req.body.identifiers = 'not-an-array';

    await updateUserService(req, res);

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

    await updateUserService(req, res);

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

    await updateUserService(req, res);

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

    await updateUserService(req, res);

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

    await updateUserService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Role role2 is not available for service service1',
      ],
    });
  });
});
