jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  removeUserService: jest.fn(),
  removeAllUserServiceIdentifiers: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { removeUserService, removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
const removeServiceFromUser = require('./../../../src/app/users/removeServiceFromUser');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When adding service to user', () => {
  let req;

  beforeEach(() => {
    removeUserService.mockReset();
    removeAllUserServiceIdentifiers.mockReset();

    req = mockRequest({
      params: {
        uid,
        sid,
        oid,
      },
    });
    res.mockResetAll();
  });

  it('then it should remove identifiers for user service', async () => {
    await removeServiceFromUser(req, res);

    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllUserServiceIdentifiers).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should remove user service', async () => {
    await removeServiceFromUser(req, res);

    expect(removeUserService).toHaveBeenCalledTimes(1);
    expect(removeUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should return 204 response', async () => {
    await removeServiceFromUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
