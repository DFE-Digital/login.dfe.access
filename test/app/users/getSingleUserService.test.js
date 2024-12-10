jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getUserService: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { getUserService } = require("./../../../src/infrastructure/data");
const getSingleUserService = require("./../../../src/app/users/getSingleUserService");

const service = {
  serviceId: "service1",
  organisationId: "organisation1",
  roles: ["role1"],
  identifiers: [{ key: "some", value: "thing" }],
  accessGrantedOn: new Date(Date.UTC(2018, 7, 17, 15, 5, 32, 123)),
};
const uid = "user1";
const sid = "service1";
const oid = "organisation1";
const res = mockResponse();

describe("When getting single user services", () => {
  let req;

  beforeEach(() => {
    getUserService.mockReset().mockReturnValue(service);

    req = mockRequest({
      params: {
        uid,
        sid,
        oid,
      },
    });
    res.mockResetAll();
  });

  it("then it should get entities from data store", async () => {
    await getSingleUserService(req, res);

    expect(getUserService).toHaveBeenCalledTimes(1);
    expect(getUserService).toHaveBeenCalledWith(uid, sid, oid);
  });

  it("then it should return json of services", async () => {
    await getSingleUserService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual({
      serviceId: "service1",
      organisationId: "organisation1",
      roles: ["role1"],
      identifiers: [{ key: "some", value: "thing" }],
      accessGrantedOn: "2018-08-17T15:05:32Z",
    });
  });

  it("then it should return 404 if no user services", async () => {
    getUserService.mockReturnValue(undefined);

    await getSingleUserService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised when calling getUserService", async () => {
    getUserService.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(getSingleUserService(req, res)).rejects.toThrow("bad times");
  });
});
