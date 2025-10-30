jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);

jest.mock("./../../../src/infrastructure/data", () => ({
  getServiceRole: jest.fn(),
  deleteServiceRole: jest.fn(),
}));

const { mockRequest, mockResponse } = require("./../../utils");
const {
  getServiceRole,
  deleteServiceRole,
} = require("./../../../src/infrastructure/data");
const deleteRoleOfService = require("./../../../src/app/services/deleteRoleOfService");

const res = mockResponse();
const sid = "service-123";
const rid = "role-abc";
const correlationId = "correlation-001";

describe("When deleting a role of a service", () => {
  let req;

  beforeEach(() => {
    getServiceRole.mockReset();
    deleteServiceRole.mockReset();
    res.mockResetAll();

    req = mockRequest({
      params: { sid, rid },
      correlationId,
    });
  });

  it("should return 204 if the role exists and is deleted successfully", async () => {
    const existingRole = { id: rid, name: "Test Role" };
    getServiceRole.mockResolvedValue(existingRole);

    await deleteRoleOfService(req, res);

    expect(getServiceRole).toHaveBeenCalledTimes(1);
    expect(getServiceRole).toHaveBeenCalledWith(sid, rid);
    expect(deleteServiceRole).toHaveBeenCalledTimes(1);
    expect(deleteServiceRole).toHaveBeenCalledWith(rid);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should return 404 if the role does not exist", async () => {
    getServiceRole.mockResolvedValue(undefined);

    await deleteRoleOfService(req, res);

    expect(deleteServiceRole).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should return 404 if the found role id does not match the requested role id", async () => {
    const existingRole = { id: "DIFFERENT-ID" };
    getServiceRole.mockResolvedValue(existingRole);

    await deleteRoleOfService(req, res);

    expect(deleteServiceRole).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if getServiceRole throws", async () => {
    getServiceRole.mockImplementation(() => {
      throw new Error("Database error");
    });

    await expect(deleteRoleOfService(req, res)).rejects.toThrow(
      "Database error",
    );
  });

  it("should throw an error if deleteServiceRole throws", async () => {
    const existingRole = { id: rid, name: "Test Role" };
    getServiceRole.mockResolvedValue(existingRole);
    deleteServiceRole.mockImplementation(() => {
      throw new Error("Failed to delete role");
    });

    await expect(deleteRoleOfService(req, res)).rejects.toThrow(
      "Failed to delete role",
    );
  });
});
