jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getInvitationService: jest.fn(),
  addInvitationServiceIdentifier: jest.fn(),
  removeAllInvitationServiceIdentifiers: jest.fn(),
  getServiceRoles: jest.fn(),
  removeAllInvitationServiceRoles: jest.fn(),
  addInvitationServiceRole: jest.fn(),
  getUserOfServiceIdentifier: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');

const { getInvitationService, addInvitationServiceIdentifier, removeAllInvitationServiceIdentifiers, getServiceRoles, getUserOfServiceIdentifier, removeAllInvitationServiceRoles, addInvitationServiceRole } = require('./../../../src/infrastructure/data');
const updateInvitationService = require ('./../../../src/app/invitations/updateInvitationService');

const iid = 'invitation1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When updating service of invitation', () => {
  let req;

  beforeEach(() => {
    getInvitationService.mockReset().mockReturnValue({
      userId: iid,
      serviceId: sid,
      organisationId: oid,
      roles: [
        { id: 'existing-role' },
      ],
      identifiers: [
        { key: 'existing', value: 'identifier' },
      ],
    });
    addInvitationServiceIdentifier.mockReset();
    removeAllInvitationServiceIdentifiers.mockReset();
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

  it('then it should get current invitation service', async () => {
    await updateInvitationService(req, res);

    expect(getInvitationService).toHaveBeenCalledTimes(1);
    expect(getInvitationService).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should return 404 if no mapping already exists for invitation/service/org', async () => {
    getInvitationService.mockReturnValue(undefined);

    await updateInvitationService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should remove existing identifiers if new identifiers specified', async () => {
    await updateInvitationService(req, res);

    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should add identifiers if specified', async () => {
    await updateInvitationService(req, res);

    expect(addInvitationServiceIdentifier).toHaveBeenCalledTimes(2);
    expect(addInvitationServiceIdentifier).toHaveBeenCalledWith(iid, sid, oid, 'some', 'thing');
    expect(addInvitationServiceIdentifier).toHaveBeenCalledWith(iid, sid, oid, 'something', 'else');
  });

  it('then it should not attempt to remove or add identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await updateInvitationService(req, res);

    expect(removeAllInvitationServiceIdentifiers).not.toHaveBeenCalled();
    expect(addInvitationServiceIdentifier).not.toHaveBeenCalled();
  });

  it('then it should remove existing roles if new roles specified', async () => {
    await updateInvitationService(req, res);

    expect(removeAllInvitationServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceRoles).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should add roles if specified', async () => {
    await updateInvitationService(req, res);

    expect(addInvitationServiceRole).toHaveBeenCalledTimes(2);
    expect(addInvitationServiceRole).toHaveBeenCalledWith(iid, sid, oid, 'role1');
    expect(addInvitationServiceRole).toHaveBeenCalledWith(iid, sid, oid, 'role3');
  });

  it('then it should not attempt to remove or add roles if none specified', async () => {
    req.body.roles = undefined;

    await updateInvitationService(req, res);

    expect(removeAllInvitationServiceRoles).not.toHaveBeenCalled();
    expect(addInvitationServiceRole).not.toHaveBeenCalled();
  });

  it('then it should return 202 response', async () => {
    await updateInvitationService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 if identifiers specified but not array', async () => {
    req.body.identifiers = 'not-an-array';

    await updateInvitationService(req, res);

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

    await updateInvitationService(req, res);

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

    await updateInvitationService(req, res);

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

    await updateInvitationService(req, res);

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

    await updateInvitationService(req, res);

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
