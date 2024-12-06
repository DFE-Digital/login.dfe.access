jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/config", () =>
  require("./../../utils").mockConfig(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  addUserServiceIdentifier: jest.fn(),
  getUserOfServiceIdentifier: jest.fn(),
}));
jest.mock("./../../../src/infrastructure/notifications");

const { mockRequest, mockResponse } = require("./../../utils");
const {
  notifyUserUpdated,
} = require("./../../../src/infrastructure/notifications");
const {
  addUserServiceIdentifier,
  getUserOfServiceIdentifier,
} = require("./../../../src/infrastructure/data");
const addServiceIdentifierToUser = require("./../../../src/app/users/addServiceIdentifierToUser");

const uid = "user1";
const sid = "service1";
const oid = "organisation1";
const key = "somekey";
const value = "withvalue";
const res = mockResponse();

describe("When adding service to user", () => {
  let req;

  beforeEach(() => {
    notifyUserUpdated.mockReset();

    addUserServiceIdentifier.mockReset();
    getUserOfServiceIdentifier.mockReset();

    req = mockRequest({
      params: {
        uid,
        sid,
        oid,
        idkey: key,
      },
      body: {
        value,
      },
    });
    res.mockResetAll();
  });

  it("then it should add identifiers to user service", async () => {
    await addServiceIdentifierToUser(req, res);

    expect(addUserServiceIdentifier).toHaveBeenCalledTimes(1);
    expect(addUserServiceIdentifier).toHaveBeenCalledWith(
      uid,
      sid,
      oid,
      key,
      value,
    );
  });

  it("then it should return 202 response", async () => {
    await addServiceIdentifierToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it should return 400 if value not specified", async () => {
    req.body.value = undefined;

    await addServiceIdentifierToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: ["Must specify value"],
    });
  });

  it("then it should return 409 if identifier already in use for service", async () => {
    getUserOfServiceIdentifier.mockReturnValue("user-1");

    await addServiceIdentifierToUser(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual({
      details: ["Identifier already in use"],
    });
  });

  it("then it should send notification of user update", async () => {
    await addServiceIdentifierToUser(req, res);

    expect(notifyUserUpdated).toHaveBeenCalledTimes(1);
    expect(notifyUserUpdated).toHaveBeenCalledWith(uid);
  });

  it("should raise an exception if an exception is raised when calling getUserOfServiceIdentifier", async () => {
    getUserOfServiceIdentifier.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(addServiceIdentifierToUser(req, res)).rejects.toThrow(
      "bad times",
    );
  });
});
