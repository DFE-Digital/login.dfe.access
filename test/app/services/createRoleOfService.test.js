jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  createServiceRole: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { createServiceRole } = require("./../../../src/infrastructure/data");
const createRoleOfService = require("./../../../src/app/services/createRoleOfService");

const res = mockResponse();

describe("When creating a role of a service", () => {
  let req;

  beforeEach(() => {
    createServiceRole.mockReset();
    req = mockRequest({
      body: {
        appId: "1234",
        roleName: "test role",
        roleCode: "test role code",
      },
    });
    res.mockResetAll();
  });

  it("should call createServiceRole with the expected values", async () => {
    await createRoleOfService(req, res);

    expect(createServiceRole).toHaveBeenCalledTimes(1);
    expect(createServiceRole).toHaveBeenCalledWith(
      "1234",
      "test role",
      "test role code",
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 if appId is not specified", async () => {
    req.body.appId = undefined;

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Application id, role name, and role code are required",
    });
  });
  it("should return 400 if roleName is not specified", async () => {
    req.body.roleName = undefined;

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Application id, role name, and role code are required",
    });
  });
  it("should return 400 if roleCode is not specified", async () => {
    req.body.roleCode = undefined;

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Application id, role name, and role code are required",
    });
  });
  it("should return 500 if createServiceRole throws", async () => {
    const error = new Error("Database error");
    createServiceRole.mockRejectedValue(error);

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Failed to create service role",
    });
  });
});
