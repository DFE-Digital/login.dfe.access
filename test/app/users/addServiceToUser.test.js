jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  addUserService: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { addUserService } = require('./../../../src/infrastructure/data');
const addServiceToUser = require('./../../../src/app/users/addServiceToUser');

const uid = 'user1';
const sid = 'service1';
const oid = 'organisation1';
const res = mockResponse();

describe('When adding service to user', () => {
  let req;

  beforeEach(() => {
    addUserService.mockReset().mockReturnValue('mapping-id');

    req = mockRequest({
      params: {
        uid,
        sid,
      },
      body: {
        organisation: oid,
      },
    });
    res.mockResetAll();
  });

  it('then it should add mapping', async () => {
    await addServiceToUser(req, res);

    expect(addUserService).toHaveBeenCalledTimes(1);
    expect(addUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it('then it should return 202 response', async () => {
    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('then it should return 400 with details if oid missing', async () => {
    req.body.organisation = undefined;

    await addServiceToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      message: 'Must specify organisation',
    });
  })
});
