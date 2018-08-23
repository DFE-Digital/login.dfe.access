jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addInvitationService: jest.fn(),
  addInvitationServiceIdentifier: jest.fn(),
  removeAllInvitationServiceIdentifiers: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { addInvitationService, addInvitationServiceIdentifier, removeAllInvitationServiceIdentifiers } = require('./../../../src/infrastructure/data');
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
      },
    });
    res.mockResetAll();
  });

  it('then it should add mapping', async () => {
    await addServiceToInvitation(req, res);

    expect(addInvitationService).toHaveBeenCalledTimes(1);
    expect(addInvitationService).toHaveBeenCalledWith(iid, sid, oid);
  });

  it('then it should remove existing identifiers if specified', async () => {
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

  it('then it should not attempt to add or remove identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToInvitation(req, res);

    expect(removeAllInvitationServiceIdentifiers).not.toHaveBeenCalled();
    expect(addInvitationServiceIdentifier).not.toHaveBeenCalled();
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
});
