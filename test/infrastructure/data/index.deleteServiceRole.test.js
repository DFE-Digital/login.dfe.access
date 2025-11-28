jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { Op } = require("sequelize");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const uuid = require("uuid");

const {
  deleteServiceRole,
} = require("../../../src/infrastructure/data/index.js");

describe("When deleting a service role", () => {
  const sid = uuid.v4();
  const rid = uuid.v4();

  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should call userServiceRoles.destroy with the correct role id", async () => {
    repository.connection.query.mockResolvedValue([]);

    await deleteServiceRole(sid, rid);

    expect(repository.userServiceRoles.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRoles.destroy).toHaveBeenCalledWith({
      where: {
        role_id: {
          [Op.eq]: rid,
        },
      },
    });
  });

  it("should call the cleanup query to find leftover user services", async () => {
    repository.connection.query.mockResolvedValueOnce([]).mockResolvedValue([]);

    await deleteServiceRole(sid, rid);

    expect(repository.connection.query).toHaveBeenCalled();
    const queryCall = repository.connection.query.mock.calls[0];
    expect(queryCall[0]).toContain("FROM user_services us");
    expect(queryCall[0]).toContain("WHERE us.service_id = :sid");
  });

  it("should delete user services when there are leftovers with no roles", async () => {
    const leftoverIds = [{ id: uuid.v4() }, { id: uuid.v4() }];

    repository.connection.query
      .mockResolvedValueOnce(leftoverIds)
      .mockResolvedValue([]);

    await deleteServiceRole(sid, rid);

    expect(repository.userServices.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServices.destroy).toHaveBeenCalledWith({
      where: {
        id: {
          [Op.in]: leftoverIds.map((row) => row.id),
        },
      },
    });
  });

  it("should delete invitation services when there are leftovers with no roles", async () => {
    const invitationId = uuid.v4();
    const orgId = uuid.v4();
    const leftoverInvitationServiceRecords = [
      {
        invitation_id: invitationId,
        organisation_id: orgId,
        service_id: sid,
      },
    ];

    repository.connection.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(leftoverInvitationServiceRecords);

    await deleteServiceRole(sid, rid);

    expect(repository.invitationServices.destroy).toHaveBeenCalledTimes(1);
    expect(repository.invitationServices.destroy).toHaveBeenCalledWith({
      where: {
        invitation_id: {
          [Op.eq]: invitationId,
        },
        organisation_id: {
          [Op.eq]: orgId,
        },
        service_id: {
          [Op.eq]: sid,
        },
      },
    });
  });

  it("should not delete user services when there are no leftovers", async () => {
    repository.connection.query.mockResolvedValueOnce([]).mockResolvedValue([]);

    await deleteServiceRole(sid, rid);

    expect(repository.userServices.destroy).not.toHaveBeenCalled();
  });

  it("should delete the role from the roles table", async () => {
    repository.connection.query.mockResolvedValueOnce([]).mockResolvedValue([]);

    await deleteServiceRole(sid, rid);

    expect(repository.roles.destroy).toHaveBeenCalledTimes(1);
    expect(repository.roles.destroy).toHaveBeenCalledWith({
      where: {
        id: {
          [Op.eq]: rid,
        },
      },
    });
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("Database error");
    repository.userServiceRoles.destroy.mockRejectedValue(error);

    await expect(deleteServiceRole(sid, rid)).rejects.toThrow("Database error");
  });
});
