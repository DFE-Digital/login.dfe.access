jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getPageOfPolicies: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { getPageOfPolicies } = require("./../../../src/infrastructure/data");
const pageOfPoliciesForService = require("./../../../src/app/services/pageOfPoliciesForService");

const policies = {
  policies: [
    {
      id: "policy1",
      name: "Policy one",
      applicationId: "application1",
      status: {
        id: 1,
      },
      conditions: [
        {
          field: "id",
          operator: "Is",
          value: "user1",
        },
      ],
      roles: [
        {
          id: "role1",
          name: "Role one",
          status: {
            id: 1,
          },
        },
      ],
    },
  ],
  page: 1,
  totalNumberOfPages: 1,
  totalNumberOfRecords: 1,
};

const sid = "service1";
const res = mockResponse();

describe("When getting page of policies for service", () => {
  let req;

  beforeEach(() => {
    getPageOfPolicies.mockReset().mockReturnValue(policies);

    req = mockRequest({
      params: {
        sid,
      },
    });
    res.mockResetAll();
  });

  it("then it should query for policies with service id and default page and pageSize", async () => {
    await pageOfPoliciesForService(req, res);

    expect(getPageOfPolicies).toHaveBeenCalledTimes(1);
    expect(getPageOfPolicies).toHaveBeenCalledWith(sid, 1, 50);
  });

  it("then it should return json policies", async () => {
    await pageOfPoliciesForService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(policies);
  });

  it("should raise an exception if an exception is raised in pageOfPoliciesForService", async () => {
    getPageOfPolicies.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(pageOfPoliciesForService(req, res)).rejects.toThrow(
      "bad times",
    );
  });
});
