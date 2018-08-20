jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addUserServiceIdentifier: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { addUserServiceIdentifier } = require('./../../../src/infrastructure/data');
const addServiceIdentifierToUser = require('./../../../src/app/users/addServiceIdentifierToUser');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const key = 'somekey';
const value = 'withvalue';
const res = mockResponse();

describe('When adding service to user', () => {
  let req;

  beforeEach(() => {
    addUserServiceIdentifier.mockReset();

    req = mockRequest({
      params: {
        uid,
        sid,
        oid,
        idkey: key,
      },
      body: {
        value,
      },
    });
    res.mockResetAll();
  });

  it('then it should add identifiers to user service', async () => {
    await addServiceIdentifierToUser(req, res);

    expect(addUserServiceIdentifier).toHaveBeenCalledTimes(1);
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(uid, sid, oid, key, value);
  });

  it('then it should return 202 response', async () => {
    await addServiceIdentifierToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 if value not specified', async () => {
    req.body.value = undefined;

    await addServiceIdentifierToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: [
        'Must specify value',
      ],
    });
  });
});
