jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getUserServices: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { getUserServices } = require("./../../../src/infrastructure/data");
const listUserServices = require("./../../../src/app/users/listUserServices");

const services = [
  {
    serviceId: "service1",
    organisationId: "organisation1",
    roles: ["role1"],
    identifiers: [{ key: "some", value: "thing" }],
    accessGrantedOn: new Date(Date.UTC(2018, 7, 17, 15, 5, 32, 123)),
  },
];
const uid = "user1";
const res = mockResponse();

describe("When listing user services", () => {
  let req;

  beforeEach(() => {
    getUserServices.mockReset().mockReturnValue(services);

    req = mockRequest({
      params: {
        uid,
      },
    });
    res.mockResetAll();
  });

  it("then it should get entities from data store", async () => {
    await listUserServices(req, res);

    expect(getUserServices).toHaveBeenCalledTimes(1);
    expect(getUserServices).toHaveBeenCalledWith(uid);
  });

  it("then it should return json of services", async () => {
    await listUserServices(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual([
      {
        serviceId: "service1",
        organisationId: "organisation1",
        roles: ["role1"],
        identifiers: [{ key: "some", value: "thing" }],
        accessGrantedOn: "2018-08-17T15:05:32Z",
      },
    ]);
  });

  it("then it should return 404 if no user services", async () => {
    getUserServices.mockReturnValue([]);

    await listUserServices(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getUserServices", async () => {
    getUserServices.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(listUserServices(req, res)).rejects.toThrow("bad times");
  });
});
