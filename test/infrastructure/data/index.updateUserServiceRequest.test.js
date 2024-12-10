jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("../../../src/infrastructure/data/organisationsRepository");
const {
  updateUserServiceRequest,
} = require("../../../src/infrastructure/data");

// existingRequest would usually be a Sequelize model object, but simulating the .update function
// on it is good enough for this test
const existingRequest = {
  user_id: "01A52B72-AE88-47BC-800B-E7DFFCE54344",
  service_id: "500DF403-4643-4CDE-9F30-3C6D8AD27AD7",
  roles: "00C2DC79-ACFA-4206-A14A-9EF37DE34F21",
  organisation_id: "11BE2E1F-4227-4FDE-81D9-14B1E3322D48",
  status: -1,
  reason: "Request rejected by approver from service",
  actioned_by: "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
  actioned_reason: "Another reason",
  actioned_at: "2023-06-29T11:31:18.265Z",
  createdAt: "2023-06-29T11:29:39.064Z",
  updatedAt: "2023-06-29T11:31:18.285Z",
  request_type: "service",
  update: jest.fn(),
};

const request = { status: 1 };

describe("When updating a user service request in the repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should update the record", async () => {
    await updateUserServiceRequest(existingRequest, request);
    expect(existingRequest.update).toHaveBeenCalledTimes(1);
    expect(existingRequest.update.mock.calls[0][0]).toEqual({
      status: 1,
      actioned_by: "EC577F8D-2B6A-4175-B920-AF0C6F7B9E3C",
      actioned_reason: "Another reason",
      actioned_at: "2023-06-29T11:31:18.265Z",
    });
  });
});
