jest.mock("./../../../src/infrastructure/logger", () =>
  require("../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getRole: jest.fn(),
  getServiceRoles: jest.fn(),
  updateRoleEntity: jest.fn(),
}));

const { mockRequest, mockResponse } = require("../../utils");
const {
  getRole,
  getServiceRoles,
  updateRoleEntity,
} = require("../../../src/infrastructure/data");
const updateRole = require("../../../src/app/services/updateRole");

const role = {
  id: "role-1",
  name: "Role one",
  code: "code-1",
  status: {
    id: 1,
  },
};

const getServiceRolesData = [
  {
    id: "role-1",
    name: "Role one",
    code: "code-1",
    numericId: "11111",
    status: {
      id: 1,
    },
  },
  {
    id: "role-2",
    name: "Role two",
    code: "code-2",
    numericId: "22222",
    status: {
      id: 1,
    },
  },
];

const roleId = "role-1";
const serviceId = "service-1";
const res = mockResponse();

describe("When patching a role of a service", () => {
  let req;

  beforeEach(() => {
    getRole.mockReset().mockReturnValue(role);
    getServiceRoles.mockReset().mockReturnValue(getServiceRolesData);
    updateRoleEntity.mockReset();

    req = mockRequest({
      params: {
        rid: roleId,
        sid: serviceId,
      },
      body: {
        name: "new-role-name",
        code: "new-role-code",
      },
    });
    res.mockResetAll();
  });

  it("should return 202 response", async () => {
    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should return 400 if body is empty", async () => {
    req.body = {};

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        "Must specify at least one property. Patchable properties name,code",
      ],
    });
  });

  it("should return 400 if name is empty", async () => {
    req.body.name = "";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'name' must be a non-empty string"],
    });
  });

  it("should return 400 if name is not a string", async () => {
    req.body.name = 123;

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'name' must be a non-empty string"],
    });
  });

  it("should return 400 if name is greater than 125 characters", async () => {
    req.body.name = "abcde12345".repeat(12) + "abcdef"; // 126 characters

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'name' cannot be greater than 125 characters"],
    });
  });

  it("should return 400 if code is empty", async () => {
    req.body.code = "";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' must be a non-empty string"],
    });
  });

  it("should return 400 if code is not a string", async () => {
    req.body.code = 1234;

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' must be a non-empty string"],
    });
  });

  it("should return 400 if code is greater than 50 characters", async () => {
    req.body.code = "abcde12345".repeat(5) + "a"; //51 characters

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' cannot be greater than 50 characters"],
    });
  });

  it("should return 400 if code is not unique within the service", async () => {
    // code-2 is used by another role in this service
    req.body.code = "code-2";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' has to be unique for roles within the service"],
    });
  });

  it("should return 400 a non-patchable property is provided", async () => {
    req.body.failingField = "should-not-exist";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        "Unpatchable property failingField. Allowed properties name,code",
      ],
    });
  });

  it(" should return 404 if role does not exist for the service", async () => {
    getServiceRoles.mockReturnValue([]);

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getRole", async () => {
    getRole.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(updateRole(req, res)).rejects.toThrow("bad times");
  });
});
