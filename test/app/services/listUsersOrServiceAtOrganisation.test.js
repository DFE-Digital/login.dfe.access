jest.mock("./../../../src/infrastructure/config", () =>
  require("./../../utils").mockConfig(),
);
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
const listUsersOfServiceAtOrganisation = require("./../../../src/app/services/listUsersOfServiceAtOrganisation");

const res = mockResponse();

describe("when listing users of service within organisation", () => {
  let req;

  beforeEach(() => {
    getUsersOfServicePaged.mockReset().mockReturnValue({
      services: [
        {
          userId: "user-1",
          serviceId: "service-1",
          organisationId: "organisation-1",
          roles: [],
          identifiers: [],
          accessGrantedOn: new Date(2019, 1, 5, 10, 27, 0),
        },
      ],
      page: 1,
      totalNumberOfPages: 1,
      totalNumberOfRecords: 10,
    });

    req = mockRequest({
      params: {
        sid: "service-1",
        oid: "organisation-1",
      },
      query: {
        page: "2",
        pageSize: "50",
      },
    });

    res.mockResetAll();
  });

  it("then it should return json page of data", async () => {
    await listUsersOfServiceAtOrganisation(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      services: [
        {
          userId: "user-1",
          serviceId: "service-1",
          organisationId: "organisation-1",
          roles: [],
          identifiers: [],
          accessGrantedOn: new Date(2019, 1, 5, 10, 27, 0),
        },
      ],
      page: 1,
      totalNumberOfPages: 1,
      totalNumberOfRecords: 10,
    });
  });

  it("then it should use page settings from query string if present", async () => {
    await listUsersOfServiceAtOrganisation(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged).toHaveBeenCalledWith(
      "service-1",
      "organisation-1",
      undefined,
      2,
      50,
    );
  });

  it("then it should default to page 1 if no page specified", async () => {
    req.query.page = undefined;

    await listUsersOfServiceAtOrganisation(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged).toHaveBeenCalledWith(
      "service-1",
      "organisation-1",
      undefined,
      1,
      50,
    );
  });

  it("then it should default to page size of 25 if no page size specified", async () => {
    req.query.pageSize = undefined;

    await listUsersOfServiceAtOrganisation(req, res);

    expect(getUsersOfServicePaged).toHaveBeenCalledTimes(1);
    expect(getUsersOfServicePaged).toHaveBeenCalledWith(
      "service-1",
      "organisation-1",
      undefined,
      2,
      25,
    );
  });

  it("then it should return bad request if specified page is not a number", async () => {
    req.query.page = "dfsdf";

    await listUsersOfServiceAtOrganisation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ["Page must be a number"],
    });
  });

  it("then it should return bad request if specified page less than 1", async () => {
    req.query.page = "0";

    await listUsersOfServiceAtOrganisation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ["Page must be at least 1"],
    });
  });

  it("then it should return bad request if specified page size is not a number", async () => {
    req.query.pageSize = "dfsdf";

    await listUsersOfServiceAtOrganisation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ["Page size must be a number"],
    });
  });

  it("then it should return bad request if specified page size less than 1", async () => {
    req.query.pageSize = "0";

    await listUsersOfServiceAtOrganisation(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ["Page size must be at least 1"],
    });
  });
});
