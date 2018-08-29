jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addUserService: jest.fn(),
  addUserServiceIdentifier: jest.fn(),
  removeAllUserServiceIdentifiers: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { addUserService, addUserServiceIdentifier, removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
const addServiceToUser = require('./../../../src/app/users/addServiceToUser');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When adding service to user', () => {
  let req;

  beforeEach(() => {
    addUserService.mockReset().mockReturnValue('mapping-id');
    addUserServiceIdentifier.mockReset();
    removeAllUserServiceIdentifiers.mockReset();

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
      },
    });
    res.mockResetAll();
  });

  it('then it should add mapping', async () => {
    await addServiceToUser(req, res);

    expect(addUserService).toHaveBeenCalledTimes(1);
    expect(addUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should remove existing identifiers if specified', async () => {
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

  it('then it should not attempt to add or remove identifiers if none specified', async () => {
    req.body.identifiers = undefined;

    await addServiceToUser(req, res);

    expect(removeAllUserServiceIdentifiers).not.toHaveBeenCalled();
    expect(addUserServiceIdentifier).not.toHaveBeenCalled();
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
});
