jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getInvitationService: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { getInvitationService } = require("./../../../src/infrastructure/data");
const getSingleInvitationService = require("./../../../src/app/invitations/getSingleInvitationService");

const service = {
  serviceId: "service1",
  organisationId: "organisation1",
  roles: ["role1"],
  identifiers: [{ key: "some", value: "thing" }],
};
const iid = "inv-user1";
const sid = "service1";
const oid = "organisation1";
const res = mockResponse();

describe("When getting single invitation service", () => {
  let req;

  beforeEach(() => {
    getInvitationService.mockReset().mockReturnValue(service);

    req = mockRequest({
      params: {
        iid,
        sid,
        oid,
      },
    });
    res.mockResetAll();
  });

  it("then it should get entities from data store", async () => {
    await getSingleInvitationService(req, res);

    expect(getInvitationService).toHaveBeenCalledTimes(1);
    expect(getInvitationService).toHaveBeenCalledWith(iid, sid, oid);
  });

  it("then it should return json of services", async () => {
    await getSingleInvitationService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual({
      serviceId: "service1",
      organisationId: "organisation1",
      roles: ["role1"],
      identifiers: [{ key: "some", value: "thing" }],
    });
  });

  it("then it should return 404 if no user services", async () => {
    getInvitationService.mockReturnValue(undefined);

    await getSingleInvitationService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getInvitationService", async () => {
    getInvitationService.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(getSingleInvitationService(req, res)).rejects.toThrow(
      "bad times",
    );
  });
});
