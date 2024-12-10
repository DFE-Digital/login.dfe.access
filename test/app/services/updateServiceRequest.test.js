jest.mock("./../../../src/infrastructure/logger", () =>
  require("../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getUserServiceRequestEntity: jest.fn(),
  updateUserServiceRequest: jest.fn(),
}));

const { mockRequest, mockResponse } = require("../../utils");
const {
  getUserServiceRequestEntity,
  updateUserServiceRequest,
} = require("../../../src/infrastructure/data");
const updateServiceRequest = require("../../../src/app/services/updateServiceRequest");

const request = {
  userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
  serviceId: "500DF403-4643-4CDE-9F30-3C6D8AD27AD7",
  roles: "00C2DC79-ACFA-4206-A14A-9EF37DE34F21",
  organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
  status: -1,
  reason: "Request rejected by approver from service",
  actionedBy: "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
  actionedReason: "2023-06-29T11:31:18.265Z",
  actionedAt: "2023-06-29T11:31:18.265Z",
  createdAt: "2023-06-29T11:29:39.064Z",
  updatedAt: "2023-06-29T11:31:18.285Z",
  requestType: "service",
};

const res = mockResponse();

describe("When patching a user request", () => {
  let req;

  const id = "f2a2d83f-843e-442d-9d3c-7d3d7d25cdd7";

  beforeEach(() => {
    getUserServiceRequestEntity.mockReset().mockReturnValue(request);
    updateUserServiceRequest.mockReset();
    req = mockRequest({
      params: {
        id: id,
      },
      body: { status: 1 },
    });
    res.mockResetAll();
  });

  it("then it should return 202 response", async () => {
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("then it error when given an unsupported field", async () => {
    req = mockRequest({
      params: {
        id,
      },
      body: { status: 1, "bad-field": "blah" },
    });
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details:
        "Unpatchable property bad-field. Allowed properties status,actioned_by,actioned_reason,actioned_at",
    });
  });

  it("then it error when given no fields", async () => {
    req = mockRequest({
      params: {
        id,
      },
      body: {},
    });
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      details:
        "Must specify at least one property. Patchable properties status,actioned_by,actioned_reason,actioned_at",
    });
  });

  it("should return 404 if the request is not found", async () => {
    getUserServiceRequestEntity.mockReset().mockReturnValue(null);
    await updateServiceRequest(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should be called with expected values if thigns are good", async () => {
    await updateServiceRequest(req, res);

    expect(updateUserServiceRequest).toHaveBeenCalledTimes(1);
    expect(updateUserServiceRequest).toHaveBeenCalledWith(request, req.body);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised in getUserService", async () => {
    getUserServiceRequestEntity.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(updateServiceRequest(req, res)).rejects.toThrow("bad times");
  });
});
