const updateLastAccess = require("../../../src/app/users/updateLastAccess");
const {
  updateUserServiceLastAccess,
} = require("../../../src/infrastructure/data");
const {
  notifyUserUpdated,
} = require("../../../src/infrastructure/notifications");

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

  beforeEach(() => {
    req = {
      params: { uid: "user123", sid: "service456", oid: "org789" },
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

  it("should return 400 if sid is missing", async () => {
    delete req.params.sid;
    await updateLastAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details: ["Must specify service"],
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

  it("should call updateUserServiceLastAccess and notifyUserUpdated on valid request", async () => {
    await updateLastAccess(req, res);
    expect(updateUserServiceLastAccess).toHaveBeenCalledWith(
      "user123",
      "service456",
      "org789",
    );
    expect(notifyUserUpdated).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalled();
  });

  it("should log an error and throw if updateUserServiceLastAccess fails", async () => {
    const error = new Error("Database error");
    updateUserServiceLastAccess.mockRejectedValue(error);
    await expect(updateLastAccess(req, res)).rejects.toThrow(error);
  });
});
