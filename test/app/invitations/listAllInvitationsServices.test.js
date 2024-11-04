jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/infrastructure/data', () => ({
  getPageOfInvitationServices: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { getPageOfInvitationServices } = require('./../../../src/infrastructure/data');
const listAllInvitationsServices = require('./../../../src/app/invitations/listAllInvitationsServices');

const page = {
  services: [
    {
      invitationId: 'invitation1',
      serviceId: 'service1',
      organisationId: 'organisation1',
      roles: ['role1'],
      identifiers: [{ key: 'some', value: 'thing' }],
    },
    {
      invitationId: 'invitation2',
      serviceId: 'service2',
      organisationId: 'organisation2',
      roles: ['role2'],
      identifiers: [{ key: 'another', value: 'something' }],
    },
  ],
  numberOfPages: 3,
};
const iid = 'invitation1';
const res = mockResponse();

describe('When listing invitation services', () => {
  let req;

  beforeEach(() => {
    getPageOfInvitationServices.mockReset().mockReturnValue(page);

    req = mockRequest({
      params: {
        iid: iid,
      },
    });
    res.mockResetAll();
  });

  it('then it should get entities from data store', async () => {
    await listAllInvitationsServices(req, res);

    expect(getPageOfInvitationServices).toHaveBeenCalledTimes(1);
    expect(getPageOfInvitationServices).toHaveBeenCalledWith(1, 100);
  });

  it('then it should use page and pageSize from query if sent', async () => {
    req.query = {
      page: 2,
      pageSize: 50,
    };

    await listAllInvitationsServices(req, res);

    expect(getPageOfInvitationServices).toHaveBeenCalledTimes(1);
    expect(getPageOfInvitationServices).toHaveBeenCalledWith(2, 50);
  });

  it('then it should return json of services', async () => {
    await listAllInvitationsServices(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual({
      services: [
        {
          invitationId: 'invitation1',
          serviceId: 'service1',
          organisationId: 'organisation1',
          roles: ['role1'],
          identifiers: [{ key: 'some', value: 'thing' }],
        },
        {
          invitationId: 'invitation2',
          serviceId: 'service2',
          organisationId: 'organisation2',
          roles: ['role2'],
          identifiers: [{ key: 'another', value: 'something' }],
        },
      ],
      numberOfPages: 3,
    });
  });

  it('then it should return 404 if no user services', async () => {
    getPageOfInvitationServices.mockReturnValue({ services: [], numberOfPages: 0 });

    await listAllInvitationsServices(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('should raise an exception if an exception is raised in getPageOfInvitationServices', async () => {
    getPageOfInvitationServices.mockImplementation(() => {
      throw new Error('bad times');
    });

    await expect(listAllInvitationsServices(req, res)).rejects.toThrow('bad times');
  });
});
