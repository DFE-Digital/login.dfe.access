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
    const leftoverIds = [{ id: uuid.v4() }, { id: uuid.v4() }];
    repository.connection.query.mockResolvedValue(leftoverIds);

    await invitationServicesCleanUp(sid);

    expect(repository.invitationServices.destroy).toHaveBeenCalledTimes(1);
    expect(repository.invitationServices.destroy).toHaveBeenCalledWith({
      where: {
        id: {
          [Op.in]: leftoverIds.map((row) => row.id),
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
