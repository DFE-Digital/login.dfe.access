jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addInvitationService: jest.fn(),
  addInvitationServiceIdentifier: jest.fn(),
  removeAllInvitationServiceIdentifiers: jest.fn(),
  getUserOfServiceIdentifier: jest.fn(),
  getServiceRoles: jest.fn(),
  removeAllInvitationServiceRoles: jest.fn(),
  addInvitationServiceRole: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { addInvitationService, addInvitationServiceIdentifier, removeAllInvitationServiceIdentifiers, getUserOfServiceIdentifier, getServiceRoles, removeAllInvitationServiceRoles, addInvitationServiceRole } = require('./../../../src/infrastructure/data');
const addServiceToInvitation = require('./../../../src/app/invitations/addServiceToInvitation');

const iid = 'invitation1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When adding service to invitation', () => {
  let req;

  beforeEach(() => {
    addInvitationService.mockReset().mockReturnValue('mapping-id');
    addInvitationServiceIdentifier.mockReset();
    removeAllInvitationServiceIdentifiers.mockReset();
    getUserOfServiceIdentifier.mockReset();
    getServiceRoles.mockReset().mockReturnValue([
      { id: 'role1' },
      { id: 'role3' },
    ]);
    removeAllInvitationServiceRoles.mockReset();
    addInvitationServiceRole.mockReset();

    req = mockRequest({
      params: {
        iid,
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
    await addServiceToInvitation(req, res);

    expect(addInvitationService).toHaveBeenCalledTimes(1);
    expect(addInvitationService).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should remove existing identifiers if new identifiers specified', async () => {
    await addServiceToInvitation(req, res);

    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should remove existing identifiers if new identifiers not specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToInvitation(req, res);

    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should add identifiers if specified', async () => {
    await addServiceToInvitation(req, res);

    expect(addInvitationServiceIdentifier).toHaveBeenCalledTimes(2);
    expect(addInvitationServiceIdentifier).toHaveBeenCalledWith(iid, sid, oid, 'some', 'thing');
    expect(addInvitationServiceIdentifier).toHaveBeenCalledWith(iid, sid, oid, 'something', 'else');
  });

  it('then it should not attempt to add identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToInvitation(req, res);

    expect(addInvitationServiceIdentifier).not.toHaveBeenCalled();
  });

  it('then it should remove existing roles if new roles specified', async () => {
    await addServiceToInvitation(req, res);

    expect(removeAllInvitationServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceRoles).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should remove existing roles if new roles not specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToInvitation(req, res);

    expect(removeAllInvitationServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceRoles).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should add roles if specified', async () => {
    await addServiceToInvitation(req, res);

    expect(addInvitationServiceRole).toHaveBeenCalledTimes(2);
    expect(addInvitationServiceRole).toHaveBeenCalledWith(iid, sid, oid, 'role1');
    expect(addInvitationServiceRole).toHaveBeenCalledWith(iid, sid, oid, 'role3');
  });

  it('then it should not attempt to add roles if none specified', async () => {
    req.body.roles = undefined;

    await addServiceToInvitation(req, res);

    expect(addInvitationServiceRole).not.toHaveBeenCalled();
  });



  it('then it should return 202 response', async () => {
    await addServiceToInvitation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 if identifiers specified but not array', async () => {
    req.body.identifiers = 'not-an-array';

    await addServiceToInvitation(req, res);

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

    await addServiceToInvitation(req, res);

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

    await addServiceToInvitation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Identifiers items must contain key and value',
      ],
    });
  });

  it('then it should return 409 if identifier already in use', async () => {
    getUserOfServiceIdentifier.mockReturnValue('user-1');

    await addServiceToInvitation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Identifier some already in use',
        'Identifier something already in use',
      ],
    });
  });

  it('then it should return 400 if roles specified but not array', async () => {
    req.body.roles = 'not-an-array';

    await addServiceToInvitation(req, res);

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

    await addServiceToInvitation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Role role2 is not available for service service1',
      ],
    });
  });

  it('should raise an exception if an exception is raised in addInvitationService', async () => {
    addInvitationService.mockImplementation(() => {
      throw new Error('bad times');
    });

    await expect(addServiceToInvitation(req, res)).rejects.toThrow('bad times');
  });
});
