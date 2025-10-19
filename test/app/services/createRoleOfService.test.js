jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  createServiceRole: jest.fn(),
}));

jest.mock("uuid", () => ({
  validate: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const { createServiceRole } = require("./../../../src/infrastructure/data");
const createRoleOfService = require("./../../../src/app/services/createRoleOfService");
const { validate } = require("uuid");

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
    const mockRole = {
      role: { id: "new", name: "test role" },
      statusCode: 201,
    };
    createServiceRole.mockResolvedValue(mockRole);
    validate.mockReturnValue(true);

    await createRoleOfService(req, res);

    expect(createServiceRole).toHaveBeenCalledTimes(1);
    expect(createServiceRole).toHaveBeenCalledWith(
      "1234",
      "test role",
      "test role code",
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(mockRole.role);
  });

  it("should return 409 if the role already exists", async () => {
    const mockExisting = {
      role: { id: "existing", name: "test role" },
      statusCode: 409,
    };
    createServiceRole.mockResolvedValue(mockExisting);
    validate.mockReturnValue(true);

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(mockExisting.role);
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

  it("should return 400 if appId is not a valid UUID", async () => {
    validate.mockReturnValue(false);

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Invalid application id format",
    });
  });

  it("should return 400 if roleName exceeds 125 characters", async () => {
    req.body.roleName = "a".repeat(126);
    validate.mockReturnValue(true);

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Role name must be 125 characters or less",
    });
  });

  it("should return 400 if roleCode exceeds 50 characters", async () => {
    req.body.roleCode = "b".repeat(51);
    validate.mockReturnValue(true);

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Role code must be 50 characters or less",
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
