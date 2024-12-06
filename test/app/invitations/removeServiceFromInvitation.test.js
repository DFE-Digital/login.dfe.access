jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  removeInvitationService: jest.fn(),
  removeAllInvitationServiceIdentifiers: jest.fn(),
  removeAllInvitationServiceRoles: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const {
  removeInvitationService,
  removeAllInvitationServiceIdentifiers,
  removeAllInvitationServiceRoles,
} = require("./../../../src/infrastructure/data");
const removeServiceFromInvitation = require("./../../../src/app/invitations/removeServiceFromInvitation");

const iid = "inv-user1";
const sid = "service1";
const oid = "organisation1";
const res = mockResponse();

describe("When removing service from invitation", () => {
  let req;

  beforeEach(() => {
    removeInvitationService.mockReset();
    removeAllInvitationServiceIdentifiers.mockReset();
    removeAllInvitationServiceIdentifiers.mockReset();

    req = mockRequest({
      params: {
        iid,
        sid,
        oid,
      },
    });
    res.mockResetAll();
  });

  it("then it should remove identifiers for invitation service", async () => {
    await removeServiceFromInvitation(req, res);

    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceIdentifiers).toHaveBeenCalledWith(
      iid,
      sid,
      oid,
    );
  });

  it("then it should remove roles for invitation service", async () => {
    await removeServiceFromInvitation(req, res);

    expect(removeAllInvitationServiceRoles).toHaveBeenCalledTimes(1);
    expect(removeAllInvitationServiceRoles).toHaveBeenCalledWith(iid, sid, oid);
  });

  it("then it should remove invitation service", async () => {
    await removeServiceFromInvitation(req, res);

    expect(removeInvitationService).toHaveBeenCalledTimes(1);
    expect(removeInvitationService).toHaveBeenCalledWith(iid, sid, oid);
  });

  it("then it should return 204 response", async () => {
    await removeServiceFromInvitation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in removeAllInvitationServiceIdentifiers", async () => {
    removeAllInvitationServiceIdentifiers.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(removeServiceFromInvitation(req, res)).rejects.toThrow(
      "bad times",
    );
  });
});
