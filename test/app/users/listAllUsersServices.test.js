jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getPageOfUserServices: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getPageOfUserServices } = require('./../../../src/infrastructure/data');
const listAllUsersServices = require('./../../../src/app/users/listAllUsersServices');

const page = {
  services: [
    {
      userId: 'user1',
      serviceId: 'service1',
      organisationId: 'organisation1',
      roles: ['role1'],
      identifiers: [{ key: 'some', value: 'thing' }],
      accessGrantedOn: new Date(Date.UTC(2018, 7, 17, 15, 5, 32, 123)),
    },
    {
      userId: 'user2',
      serviceId: 'service2',
      organisationId: 'organisation2',
      roles: ['role2'],
      identifiers: [{ key: 'another', value: 'something' }],
      accessGrantedOn: new Date(Date.UTC(2018, 8, 18, 16, 15, 2, 987)),
    },
  ],
  numberOfPages: 3
};
const uid = 'user1';
const res = mockResponse();

describe('When listing user services', () => {
  let req;

  beforeEach(() => {
    getPageOfUserServices.mockReset().mockReturnValue(page);

    req = mockRequest({
      params: {
        uid,
      },
    });
    res.mockResetAll();
  });

  it('then it should get entities from data store', async () => {
    await listAllUsersServices(req, res);

    expect(getPageOfUserServices).toHaveBeenCalledTimes(1);
    expect(getPageOfUserServices).toHaveBeenCalledWith(1, 100);
  });

  it('then it should use page and pageSize from query if sent', async () => {
    req.query = {
      page: 2,
      pageSize: 50,
    };

    await listAllUsersServices(req, res);

    expect(getPageOfUserServices).toHaveBeenCalledTimes(1);
    expect(getPageOfUserServices).toHaveBeenCalledWith(2, 50);
  });

  it('then it should return json of services', async () => {
    await listAllUsersServices(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual({
      services: [
        {
          userId: 'user1',
          serviceId: 'service1',
          organisationId: 'organisation1',
          roles: ['role1'],
          identifiers: [{ key: 'some', value: 'thing' }],
          accessGrantedOn: '2018-08-17T15:05:32Z',
        },
        {
          userId: 'user2',
          serviceId: 'service2',
          organisationId: 'organisation2',
          roles: ['role2'],
          identifiers: [{ key: 'another', value: 'something' }],
          accessGrantedOn: '2018-09-18T16:15:02Z',
        },
      ],
      numberOfPages: 3
    });
  });

  it('then it should return 404 if no user services', async () => {
    getPageOfUserServices.mockReturnValue({ services: [], numberOfPages: 0 });

    await listAllUsersServices(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
