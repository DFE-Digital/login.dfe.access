jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { Op, QueryTypes } = require("sequelize");
const { userServicesCleanUp } = require("./../../../src/infrastructure/data");

describe("When cleaning up user services for a service id", () => {
  const sid = "service-123";

  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should not delete anything if there are no leftover user services", async () => {
    repository.connection.query.mockResolvedValue([]);

    await userServicesCleanUp(sid);

    expect(repository.connection.query).toHaveBeenCalledTimes(1);
    expect(repository.connection.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT us.id"),
      {
        type: QueryTypes.SELECT,
        replacements: { sid },
      },
    );
    expect(repository.userServices.destroy).not.toHaveBeenCalled();
  });

  it("should delete leftover user services when some are found", async () => {
    repository.connection.query.mockResolvedValue([
      { id: "us-1" },
      { id: "us-2" },
    ]);

    await userServicesCleanUp(sid);

    expect(repository.userServices.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServices.destroy).toHaveBeenCalledWith({
      where: {
        id: {
          [Op.in]: ["us-1", "us-2"],
        },
      },
    });
  });
});
