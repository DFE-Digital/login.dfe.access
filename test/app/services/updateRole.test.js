jest.mock("./../../../src/infrastructure/logger", () =>
  require("../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getRole: jest.fn(),
  updateRoleEntity: jest.fn(),
}));

const { mockRequest, mockResponse } = require("../../utils");
const {
  getRole,
  updateRoleEntity,
} = require("../../../src/infrastructure/data");
const updateRole = require("../../../src/app/services/updateRole");

const role = {
  id: "role1",
  name: "Role one",
  code: "code-1",
  status: {
    id: 1,
  },
};

const roleId = "role-1";
const res = mockResponse();

describe("When patching a role of a service", () => {
  let req;

  beforeEach(() => {
    getRole.mockReset().mockReturnValue(role);
    updateRoleEntity.mockReset();

    req = mockRequest({
      params: {
        roleId,
      },
      body: {
        name: "new-role-name",
        code: "new-role-code",
      },
    });
    res.mockResetAll();
  });

  it("then it should return 202 response", async () => {
    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it should return 400 if body is empty", async () => {
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

  it("then it should return 400 if name is empty", async () => {
    req.body.name = "";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'name' cannot be empty"],
    });
  });

  it("then it should return 400 if name is greater than 125 characters", async () => {
    req.body.name = "abcde12345".repeat(12) + "abcdef"; // 126 characters

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'name' cannot be greater than 125 characters"],
    });
  });

  it("then it should return 400 if code is empty", async () => {
    req.body.code = "";

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' cannot be empty"],
    });
  });

  it("then it should return 400 if code is greater than 50 characters", async () => {
    req.body.code = "abcde12345".repeat(5) + "a"; //51 characters

    await updateRole(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      errors: ["'code' cannot be greater than 50 characters"],
    });
  });

  it("then it should return 400 a non-patchable property is provided", async () => {
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

  it("then it should return 404 if role not found", async () => {
    getRole.mockReturnValue(undefined);

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
