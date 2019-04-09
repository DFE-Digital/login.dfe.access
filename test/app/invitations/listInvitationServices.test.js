jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getInvitationServices: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getInvitationServices } = require('./../../../src/infrastructure/data');
const listInvitationServices = require('./../../../src/app/invitations/listInvitationServices');

const services = [
  {
    serviceId: 'service1',
    organisationId: 'organisation1',
    roles: ['role1'],
    identifiers: [{ key: 'some', value: 'thing' }],
  },
];
const iid = 'invitation1';
const res = mockResponse();

describe('When listing invitation services', () => {
  let req;

  beforeEach(() => {
    getInvitationServices.mockReset().mockReturnValue(services);

    req = mockRequest({
      params: {
        iid: iid,
      },
    });
    res.mockResetAll();
  });

  it('then it should get entities from data store', async () => {
    await listInvitationServices(req, res);

    expect(getInvitationServices).toHaveBeenCalledTimes(1);
    expect(getInvitationServices).toHaveBeenCalledWith(iid);
  });

  it('then it should return json of services', async () => {
    await listInvitationServices(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual([
      {
        serviceId: 'service1',
        organisationId: 'organisation1',
        roles: ['role1'],
        identifiers: [{ key: 'some', value: 'thing' }],
      },
    ]);
  });

  it('then it should return 404 if no user services', async () => {
    getInvitationServices.mockReturnValue([]);

    await listInvitationServices(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
