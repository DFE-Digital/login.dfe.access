const updateLastAccess = require("../../../src/app/users/updateLastAccess");
const {
  updateUserServiceLastAccess,
} = require("../../../src/infrastructure/data");

jest.mock("./../../../src/infrastructure/config", () =>
  require("../../utils").mockConfig(),
);
jest.mock("./../../../src/infrastructure/logger", () =>
  require("../../utils").mockLogger(),
);
jest.mock("../../../src/infrastructure/data", () => ({
  updateUserServiceLastAccess: jest.fn(),
}));
jest.mock("../../../src/infrastructure/notifications", () => ({
  notifyUserUpdated: jest.fn(),
}));

describe("when setting the lastAccess date for a user, organisation and service", () => {
  let req;
  let res;

  const userId = "57a978f2-d7b7-4c33-b2af-87fd253e2ef3";
  const serviceId = "4e1ace4b-35c5-4b90-b03f-219838bff610";
  const orgId = "719bec7b-53e0-4cdb-a80e-affea0793ab3";

  beforeEach(() => {
    req = {
      params: { uid: userId, sid: serviceId, oid: orgId },
      req: { correlationId: "test-correlation-id" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 400 if uid is missing", async () => {
    delete req.params.uid;
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ details: ["Must specify user"] });
  });

  it("should return 400 if uid is an invalid uuid", async () => {
    req.params.uid = "an-invalid-uuid";
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["User must be a valid uuid"],
    });
  });

  it("should return 400 if sid is missing", async () => {
    delete req.params.sid;
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["Must specify service"],
    });
  });

  it("should return 400 if sid is an invalid uuid", async () => {
    req.params.sid = "an-invalid-uuid";
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["Service must be a valid uuid"],
    });
  });

  it("should return 400 if oid is missing", async () => {
    delete req.params.oid;
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["Must specify organisation"],
    });
  });

  it("should return 400 if oid is an invalid uuid", async () => {
    req.params.oid = "an-invalid-uuid";
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["Organisation must be a valid uuid"],
    });
  });

  it("should return 404 if no record is updated", async () => {
    await updateLastAccess(req, res);
    expect(updateUserServiceLastAccess).toHaveBeenCalledWith(
      userId,
      serviceId,
      orgId,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalled();
  });

  it("should call updateUserServiceLastAccess on valid request", async () => {
    updateUserServiceLastAccess.mockReturnValue("a-uuid");
    await updateLastAccess(req, res);
    expect(updateUserServiceLastAccess).toHaveBeenCalledWith(
      userId,
      serviceId,
      orgId,
    );
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalled();
  });

  it("should log an error and throw if updateUserServiceLastAccess fails", async () => {
    const error = new Error("Database error");
    updateUserServiceLastAccess.mockRejectedValue(error);
    await expect(updateLastAccess(req, res)).rejects.toThrow(error);
  });
});
