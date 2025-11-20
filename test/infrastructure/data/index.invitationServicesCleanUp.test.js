jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { Op, QueryTypes } = require("sequelize");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const uuid = require("uuid");

const {
  invitationServicesCleanUp,
} = require("../../../src/infrastructure/data/index.js");

describe("When cleaning up invitation services", () => {
  const sid = uuid.v4();

  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should query for leftover invitation services with no roles", async () => {
    repository.connection.query.mockResolvedValue([]);

    await invitationServicesCleanUp(sid);

    expect(repository.connection.query).toHaveBeenCalledTimes(1);
    expect(repository.connection.query).toHaveBeenCalledWith(
      expect.stringContaining("FROM invitation_services ins"),
      {
        type: QueryTypes.SELECT,
        replacements: { sid },
      },
    );
  });

  it("should delete invitation services when there are leftovers with no roles", async () => {
    const invitationId1 = uuid.v4();
    const invitationId2 = uuid.v4();
    const orgId1 = uuid.v4();
    const orgId2 = uuid.v4();

    const leftoverRecords = [
      {
        invitation_id: invitationId1,
        organisation_id: orgId1,
        service_id: sid,
      },
      {
        invitation_id: invitationId2,
        organisation_id: orgId2,
        service_id: sid,
      },
    ];
    repository.connection.query.mockResolvedValue(leftoverRecords);

    await invitationServicesCleanUp(sid);

    expect(repository.invitationServices.destroy).toHaveBeenCalledTimes(2);
    expect(repository.invitationServices.destroy).toHaveBeenCalledWith({
      where: {
        invitation_id: {
          [Op.eq]: invitationId1,
        },
        organisation_id: {
          [Op.eq]: orgId1,
        },
        service_id: {
          [Op.eq]: sid,
        },
      },
    });
    expect(repository.invitationServices.destroy).toHaveBeenCalledWith({
      where: {
        invitation_id: {
          [Op.eq]: invitationId2,
        },
        organisation_id: {
          [Op.eq]: orgId2,
        },
        service_id: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it("should not delete invitation services when there are no leftovers", async () => {
    repository.connection.query.mockResolvedValue([]);

    await invitationServicesCleanUp(sid);

    expect(repository.invitationServices.destroy).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("Database error");
    repository.connection.query.mockRejectedValue(error);

    await expect(invitationServicesCleanUp(sid)).rejects.toThrow(
      "Database error",
    );
  });
});
