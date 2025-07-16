jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getUsersOfServicePaged: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const {
  getUsersOfServicePaged,
} = require("./../../../src/infrastructure/data");
const listUsersOfService = require("./../../../src/app/services/listUsersOfService");

const services = [
  {
    serviceId: "service1",
    organisationId: "organisation1",
    roles: ["role1"],
    identifiers: [{ key: "some", value: "thing" }],
    accessGrantedOn: new Date(Date.UTC(2018, 7, 17, 15, 5, 32, 123)),
  },
];
const page = 1;
const totalNumberOfPages = 2;
const totalNumberOfRecords = 3;
const pageSize = 25;
const sid = "service1";
const filteridkey = "k2s-id";
const filteridvalue = "123456";
const res = mockResponse();

describe("When listing users of a service", () => {
  let req;
  let postReq;

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
      },
    });

    postReq = mockRequest({
      params: {
        sid,
      },
      method: "POST",
      body: {
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
    });

    res.mockResetAll();
  });

  it("should query using service id and pagination params when provided", async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][0]).toBe(sid);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][2]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(page);
    expect(getUsersOfServicePaged.mock.calls[0][5]).toBe(pageSize);
  });

  it("should include filter idkey and idvalue filter if present", async () => {
    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][3]).toMatchObject({
      idkey: filteridkey,
    });
    expect(getUsersOfServicePaged.mock.calls[0][3]).toMatchObject({
      idvalue: filteridvalue,
    });
  });

  it("should query using defalult page size of 50 when param not provided", async () => {
    req.query.pageSize = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(page);
    expect(getUsersOfServicePaged.mock.calls[0][5]).toBe(50);
  });

  it("should raise an error if pageSize is not a number", async () => {
    req.query.pageSize = "not-a-number";

    await expect(listUsersOfService(req, res)).rejects.toThrow(
      "pageSize must be a number",
    );

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(0);
  });

  it("should query using defalult page of 1 when param not provided", async () => {
    req.query.page = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][1]).toBeUndefined();
    expect(getUsersOfServicePaged.mock.calls[0][4]).toBe(1);
    expect(getUsersOfServicePaged.mock.calls[0][5]).toBe(pageSize);
  });

  it("should raise an error if page is not a number", async () => {
    req.query.page = "not-a-number";

    await expect(listUsersOfService(req, res)).rejects.toThrow(
      "page must be a number",
    );

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(0);
  });

  it("should not include filters if none present", async () => {
    req.query.filteridkey = undefined;
    req.query.filteridvalue = undefined;

    await listUsersOfService(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toBeUndefined();
  });

  it("should convert a single userId in a POST request to an array", async () => {
    postReq.body.userIds = ["user-1"];

    await listUsersOfService(postReq, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toStrictEqual(["user-1"]);
  });

  it("should convert an array of userIds in a POST request to an array", async () => {
    postReq.body.userIds = ["user-1", "user-2", "user-3"];

    await listUsersOfService(postReq, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged.mock.calls[0][2]).toStrictEqual([
      "user-1",
      "user-2",
      "user-3",
    ]);
  });
});
