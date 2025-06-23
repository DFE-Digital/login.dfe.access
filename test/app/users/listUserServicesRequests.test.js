jest.mock("./../../../src/infrastructure/logger", () =>
  require("../../utils").mockLogger(),
);
jest.mock("./../../../src/infrastructure/data", () => ({
  getUserServiceRequests: jest.fn(),
}));

const { mockRequest, mockResponse } = require("../../utils");
const { getUserServiceRequests } = require("../../../src/infrastructure/data");
const listUserServiceRequests = require("../../../src/app/users/listUserServiceRequests");

const serviceRequests = [
  {
    userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
    serviceId: "500DF403-4643-4CDE-9F30-3C6D8AD27AD7",
    roles: "00C2DC79-ACFA-4206-A14A-9EF37DE34F21",
    organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
    status: -1,
    reason: "Request rejected by approver from service",
    actionedBy: "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
    actionedReason: "Rejected",
    actionedAt: "2023-06-29T11:31:18.265Z",
    createdAt: "2023-06-29T11:29:39.064Z",
    updatedAt: "2023-06-29T11:31:18.285Z",
    requestType: "service",
  },
  {
    userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
    serviceId: "7B7E2D82-1228-4547-907C-40A2A35D0704",
    organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
    status: 0,
    actionedReason: "Pending",
    createdAt: "2024-06-04T09:47:36.718Z",
    updatedAt: "2024-06-09T00:00:00.173Z",
    requestType: "service",
  },
  {
    userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
    serviceId: "500DF403-4643-4CDE-9F30-3C6D8AD27AD7",
    roles: "00C2DC79-ACFA-4206-A14A-9EF37DE34F21",
    organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
    status: 1,
    actionedBy: "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
    actionedReason: "Approved",
    actionedAt: "2023-06-29T09:39:55.942Z",
    createdAt: "2023-06-29T09:38:01.030Z",
    updatedAt: "2023-06-29T09:39:55.949Z",
    requestType: "service",
  },
  {
    userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
    serviceId: "7B7E2D82-1228-4547-907C-40A2A35D0704",
    organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
    status: 2,
    actionedReason: "Overdue",
    createdAt: "2024-06-04T09:47:36.718Z",
    updatedAt: "2024-06-09T00:00:00.173Z",
    requestType: "service",
  },
  {
    userId: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
    serviceId: "7B7E2D82-1228-4547-907C-40A2A35D0704",
    organisationId: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
    status: 3,
    actionedReason: "Pending",
    createdAt: "2024-06-04T09:47:36.718Z",
    updatedAt: "2024-06-09T00:00:00.173Z",
    requestType: "service",
  },
];

const uid = "user1";
const res = mockResponse();

describe("When listing user services", () => {
  let req;

  beforeEach(() => {
    getUserServiceRequests.mockReset().mockReturnValue(serviceRequests);

    req = mockRequest({
      params: {
        uid,
      },
    });
    res.mockResetAll();
  });

  it("should get entities from data store", async () => {
    await listUserServiceRequests(req, res);

    expect(getUserServiceRequests).toHaveBeenCalledTimes(1);
    expect(getUserServiceRequests).toHaveBeenCalledWith(uid);
  });

  it("should return json of services", async () => {
    await listUserServiceRequests(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toEqual(serviceRequests);
  });

  it("should return 404 if no user service requests", async () => {
    getUserServiceRequests.mockReturnValue([]);

    await listUserServiceRequests(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("should raise an exception if an exception is raised while searching", async () => {
    getUserServiceRequests.mockImplementation(() => {
      throw new Error("bad times");
    });

    await expect(listUserServiceRequests(req, res)).rejects.toThrow(
      "bad times",
    );
  });
});
