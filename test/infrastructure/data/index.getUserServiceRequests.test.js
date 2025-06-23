jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const {
  mockUserServiceRequestEntity,
} = require("./mockOrganisationsRepository");
const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { getUserServiceRequests } = require("../../../src/infrastructure/data");
const { Op } = require("sequelize");

const uid = "user-1";
const serviceRequests = [
  mockUserServiceRequestEntity({}, 3),
  mockUserServiceRequestEntity({}, 2),
  mockUserServiceRequestEntity({}, 1),
  mockUserServiceRequestEntity({}, 0),
  mockUserServiceRequestEntity({}, -1),
];

describe("When getting user services from the repository", () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServiceRequests.findAll.mockReturnValue(serviceRequests);

    serviceRequests[0].mockResetAll();
    serviceRequests[1].mockResetAll();
    serviceRequests[2].mockResetAll();
    serviceRequests[3].mockResetAll();
    serviceRequests[4].mockResetAll();
  });

  it("then it should find all for user_id", async () => {
    await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(
      repository.userServiceRequests.findAll.mock.calls[0][0],
    ).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
        },
      },
    });
  });

  it("then it should order results by service id, then organisation id", async () => {
    await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(
      repository.userServiceRequests.findAll.mock.calls[0][0],
    ).toMatchObject({
      order: ["service_id", "organisation_id"],
    });
  });

  it("should return undefined after mapping if no results", async () => {
    repository.userServiceRequests.findAll.mockReturnValue(undefined);
    const result = await getUserServiceRequests(uid);

    expect(repository.userServiceRequests.findAll).toHaveBeenCalledTimes(1);
    expect(
      repository.userServiceRequests.findAll.mock.calls[0][0],
    ).toMatchObject({
      order: ["service_id", "organisation_id"],
    });
    expect(result).toBe(undefined);
  });

  it("then it should return services mapped to model", async () => {
    const actual = await getUserServiceRequests(uid);

    expect(actual.length).toBe(5);
    expect(actual[0]).toStrictEqual({
      id: serviceRequests[0].id,
      userId: serviceRequests[0].user_id,
      serviceId: serviceRequests[0].service_id,
      organisationId: serviceRequests[0].organisation_id,
      roles: serviceRequests[0].role_ids,
      status: 3,
      reason: serviceRequests[0].reason,
      actionedBy: serviceRequests[0].actioned_by,
      actionedReason: "Pending",
      actionedAt: serviceRequests[0].actioned_at,
      createdAt: serviceRequests[0].createdAt,
      updatedAt: serviceRequests[0].updatedAt,
      requestType: serviceRequests[0].request_type,
    });
    expect(actual[1]).toEqual({
      id: serviceRequests[1].id,
      userId: serviceRequests[1].user_id,
      serviceId: serviceRequests[1].service_id,
      organisationId: serviceRequests[1].organisation_id,
      roles: serviceRequests[1].role_ids,
      status: 2,
      reason: serviceRequests[1].reason,
      actionedBy: serviceRequests[1].actioned_by,
      actionedReason: "Overdue",
      actionedAt: serviceRequests[1].actioned_at,
      createdAt: serviceRequests[1].createdAt,
      updatedAt: serviceRequests[1].updatedAt,
      requestType: serviceRequests[1].request_type,
    });
    expect(actual[2]).toEqual({
      id: serviceRequests[2].id,
      userId: serviceRequests[2].user_id,
      serviceId: serviceRequests[2].service_id,
      organisationId: serviceRequests[2].organisation_id,
      roles: serviceRequests[2].role_ids,
      status: 1,
      reason: serviceRequests[2].reason,
      actionedBy: serviceRequests[2].actioned_by,
      actionedReason: "Approved",
      actionedAt: serviceRequests[2].actioned_at,
      createdAt: serviceRequests[2].createdAt,
      updatedAt: serviceRequests[2].updatedAt,
      requestType: serviceRequests[2].request_type,
    });
    expect(actual[3]).toStrictEqual({
      id: serviceRequests[3].id,
      userId: serviceRequests[3].user_id,
      serviceId: serviceRequests[3].service_id,
      organisationId: serviceRequests[3].organisation_id,
      roles: serviceRequests[3].role_ids,
      status: 0,
      reason: serviceRequests[3].reason,
      actionedBy: serviceRequests[3].actioned_by,
      actionedReason: "Pending",
      actionedAt: serviceRequests[3].actioned_at,
      createdAt: serviceRequests[3].createdAt,
      updatedAt: serviceRequests[3].updatedAt,
      requestType: serviceRequests[3].request_type,
    });
    expect(actual[4]).toEqual({
      id: serviceRequests[4].id,
      userId: serviceRequests[4].user_id,
      serviceId: serviceRequests[4].service_id,
      organisationId: serviceRequests[4].organisation_id,
      roles: serviceRequests[4].role_ids,
      status: -1,
      reason: serviceRequests[4].reason,
      actionedBy: serviceRequests[4].actioned_by,
      actionedReason: "Rejected",
      actionedAt: serviceRequests[4].actioned_at,
      createdAt: serviceRequests[4].createdAt,
      updatedAt: serviceRequests[4].updatedAt,
      requestType: serviceRequests[4].request_type,
    });
  });
});
