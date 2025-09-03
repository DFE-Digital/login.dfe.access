jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getPolicy: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { getPolicy } = require("./../../../src/infrastructure/data");
const getPolicyOfService = require("./../../../src/app/services/getPolicyOfService");

const policy = {
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
};
const sid = policy.applicationId;
const pid = policy.id;
const res = mockResponse();

describe("When getting policy of a service", () => {
  let req;

  beforeEach(() => {
    getPolicy.mockReset().mockReturnValue(policy);

    req = mockRequest({
      params: {
        sid,
        pid,
      },
    });
    res.mockResetAll();
  });

  it("then it should query for policy with policy id", async () => {
    await getPolicyOfService(req, res);

    expect(getPolicy).toHaveBeenCalledTimes(1);
    expect(getPolicy).toHaveBeenCalledWith(pid);
  });

  it("then it should return json policy", async () => {
    await getPolicyOfService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(policy);
  });

  it("then it should return 404 if policy not found", async () => {
    getPolicy.mockReturnValue(undefined);

    await getPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it should return 404 if policy found but not for service", async () => {
    const policy1 = Object.assign({}, policy, { applicationId: "different" });
    getPolicy.mockReturnValue(policy1);

    await getPolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getPolicy", async () => {
    getPolicy.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(getPolicyOfService(req, res)).rejects.toThrow("bad times");
  });
});
