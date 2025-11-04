jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getPolicy: jest.fn(),
  addPolicy: jest.fn(),
  addPolicyCondition: jest.fn(),
  addPolicyRole: jest.fn(),
  deletePolicyConditions: jest.fn(),
  deletePolicyRoles: jest.fn(),
}));
jest.mock("uuid");

const { mockRequest, mockResponse } = require("./../../utils");
const {
  getPolicy,
  addPolicy,
  addPolicyCondition,
  addPolicyRole,
  deletePolicyConditions,
  deletePolicyRoles,
} = require("./../../../src/infrastructure/data");
const uuid = require("uuid");
const updatePolicyOfService = require("./../../../src/app/services/updatePolicyOfService");

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
      value: ["user1"],
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

describe("When patching a policy of a service", () => {
  let req;
  let uuidCounter;

  beforeEach(() => {
    getPolicy.mockReset().mockReturnValue(policy);
    addPolicy.mockReset();
    addPolicyCondition.mockReset();
    addPolicyRole.mockReset();
    deletePolicyConditions.mockReset();
    deletePolicyRoles.mockReset();

    uuidCounter = 0;
    uuid.v4.mockReset().mockImplementation(() => {
      uuidCounter++;
      return `new-uuid-${uuidCounter}`;
    });

    req = mockRequest({
      params: {
        sid,
        pid,
      },
      body: {},
    });
    res.mockResetAll();
  });

  it("then it should return 202 response", async () => {
    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it should include location of resource", async () => {
    await updatePolicyOfService(req, res);

    expect(res.set).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith(
      "Location",
      `/services/${sid}/policies/${pid}`,
    );
  });

  it("then it should not update any attribute of the policy not included", async () => {
    await updatePolicyOfService(req, res);

    expect(addPolicy).toHaveBeenCalledTimes(1);
    expect(addPolicy).toHaveBeenCalledWith(
      policy.id,
      policy.name,
      policy.applicationId,
      policy.status.id,
    );
  });

  it("then it should update name if included", async () => {
    req.body.name = "policy one a";

    await updatePolicyOfService(req, res);

    expect(addPolicy).toHaveBeenCalledTimes(1);
    expect(addPolicy).toHaveBeenCalledWith(
      policy.id,
      "policy one a",
      policy.applicationId,
      policy.status.id,
    );
  });

  it("then it should update status if included", async () => {
    req.body.status = { id: 0 };

    await updatePolicyOfService(req, res);

    expect(addPolicy).toHaveBeenCalledTimes(1);
    expect(addPolicy).toHaveBeenCalledWith(
      policy.id,
      policy.name,
      policy.applicationId,
      0,
    );
  });

  it("then it should not update conditions if not included", async () => {
    await updatePolicyOfService(req, res);

    expect(deletePolicyConditions).toHaveBeenCalledTimes(0);
    expect(addPolicyCondition).toHaveBeenCalledTimes(0);
  });

  it("then it should delete all existing conditions and add new ones when included", async () => {
    req.body.conditions = [
      {
        field: "id",
        operator: "Is",
        value: ["123456"],
      },
    ];

    await updatePolicyOfService(req, res);

    expect(deletePolicyConditions).toHaveBeenCalledTimes(1);
    expect(deletePolicyConditions).toHaveBeenCalledWith(pid);
    expect(addPolicyCondition).toHaveBeenCalledTimes(1);
    expect(addPolicyCondition).toHaveBeenCalledWith(
      "new-uuid-1",
      pid,
      req.body.conditions[0].field,
      req.body.conditions[0].operator,
      req.body.conditions[0].value[0],
    );
  });

  it("then it should not update roles if not included", async () => {
    await updatePolicyOfService(req, res);

    expect(deletePolicyRoles).toHaveBeenCalledTimes(0);
    expect(addPolicyRole).toHaveBeenCalledTimes(0);
  });

  it("then it should delete all existing roles and add new ones when included", async () => {
    req.body.roles = [
      {
        id: "role1",
      },
    ];

    await updatePolicyOfService(req, res);

    expect(deletePolicyRoles).toHaveBeenCalledTimes(1);
    expect(deletePolicyRoles).toHaveBeenCalledWith(pid);
    expect(addPolicyRole).toHaveBeenCalledTimes(1);
    expect(addPolicyRole).toHaveBeenCalledWith(pid, req.body.roles[0].id);
  });

  it("then it should return 400 if conditions is not an array", async () => {
    req.body.conditions = "not-an-array";

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions must be an array"],
    });
  });

  it("then it should return 400 if conditions has no entries", async () => {
    req.body.conditions = [];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions must have at least one entry"],
    });
  });

  it("then it should return 400 if conditions entry is missing field", async () => {
    req.body.conditions = [
      {
        field: undefined,
        operator: "Is",
        value: ["123456"],
      },
    ];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions entries must have field"],
    });
  });

  it("then it should return 400 if conditions entry is missing operator", async () => {
    req.body.conditions = [
      {
        field: "id",
        operator: undefined,
        value: ["123456"],
      },
    ];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions entries must have operator"],
    });
  });

  it("then it should return 400 if conditions entry is missing value", async () => {
    req.body.conditions = [
      {
        field: "id",
        operator: "Is",
        value: undefined,
      },
    ];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions entries must have value"],
    });
  });

  it("then it should return 400 if conditions entry value is not an array", async () => {
    req.body.conditions = [
      {
        field: "id",
        operator: "Is",
        value: "just-a-value",
      },
    ];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Conditions entries value must be an array"],
    });
  });

  it("then it should return 400 if roles is not an array", async () => {
    req.body.roles = "not-an-array";

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Roles must be an array"],
    });
  });

  it("then it should return 400 if roles entry is missing id", async () => {
    req.body.roles = [
      {
        id: undefined,
      },
    ];

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["Roles entries must have id"],
    });
  });

  it("then it should return 404 if policy not found", async () => {
    getPolicy.mockReturnValue(undefined);

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it should return 404 if policy found but not for service", async () => {
    const policy1 = Object.assign({}, policy, { applicationId: "different" });
    getPolicy.mockReturnValue(policy1);

    await updatePolicyOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getPolicy", async () => {
    getPolicy.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(updatePolicyOfService(req, res)).rejects.toThrow("bad times");
  });
});
