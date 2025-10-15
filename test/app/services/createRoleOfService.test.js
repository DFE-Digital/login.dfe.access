jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  createServiceRole: jest.fn(),
}));
jest.mock("uuid");

const { mockRequest, mockResponse } = require("./../../utils");
const { createServiceRole } = require("./../../../src/infrastructure/data");
const uuid = require("uuid");
const createRoleOfService = require("./../../../src/app/services/createRoleOfService");

const sid = "service1";
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

  it("should return 400 if name is not specified", async () => {
    req.body.roleName = undefined;

    await createRoleOfService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Application id, role name, and role code are required",
    });
  });
});
