jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getUsersOfServicePaged: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getUsersOfServicePaged } = require('./../../../src/infrastructure/data');
const listUsersOfService = require('./../../../src/app/services/listUsersOfService');

const services = [
  {
    serviceId: 'service1',
    organisationId: 'organisation1',
    roles: ['role1'],
    identifiers: [{ key: 'some', value: 'thing' }],
    accessGrantedOn: new Date(Date.UTC(2018, 7, 17, 15, 5, 32, 123)),
  },
];
const page = 1;
const totalNumberOfPages = 2;
const totalNumberOfRecords = 3;
const pageSize = 25;
const sid = 'service1';
const filteridkey = 'k2s-id';
const filteridvalue = '123456';
const res = mockResponse();

describe('When listing services of a service', () => {
  let req;

  beforeEach(() => {
    getUsersOfServicePaged.mockReset().mockReturnValue({
      services,
      page,
      totalNumberOfPages,
      totalNumberOfRecords,
    });

    req = mockRequest({
      params: {
        sid,
      },
      query: {
        page: page.toString(),
        pageSize: pageSize.toString(),
        filteridkey,
        filteridvalue,
      }
    });
    res.mockResetAll();
  });

  it('then it should query using service id', async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][0]).toBe(sid);
  });

  it('then it should query using pagination params when provided', async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][3]).toBe(page);
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(pageSize);
  });

  it('then it should query using defalult page size of 50 when param not provided', async () => {
    req.query.pageSize = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][3]).toBe(page);
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(50);
  });

  it('then it should query using defalult page of 1 when param not provided', async () => {
    req.query.page = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][3]).toBe(1);
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(pageSize);
  });

  it('then it should include filter idkey filter if present', async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toMatchObject({
      idkey: filteridkey,
    });
  });

  it('then it should include filter idvalue filter if present', async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toMatchObject({
      idvalue: filteridvalue,
    });
  });

  it('then it should not include filters if none present', async () => {
    req.query.filteridkey = undefined;
    req.query.filteridvalue = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toBeUndefined();
  });
});
