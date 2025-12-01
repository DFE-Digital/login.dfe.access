jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { QueryTypes } = require("sequelize");
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

  it("should DELETE leftover invitation services with no roles", async () => {
    repository.connection.query.mockResolvedValue([]);

    await invitationServicesCleanUp(sid);

    expect(repository.connection.query).toHaveBeenCalledTimes(1);
    expect(repository.connection.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE ins"),
      {
        type: QueryTypes.DELETE,
        replacements: { sid },
      },
    );
  });

  it("should use NOT EXISTS to identify invitation services with no roles", async () => {
    repository.connection.query.mockResolvedValue([]);

    await invitationServicesCleanUp(sid);

    const queryCall = repository.connection.query.mock.calls[0];
    const query = queryCall[0];

    expect(query).toContain("FROM invitation_services ins");
    expect(query).toContain("WHERE ins.service_id = :sid");
    expect(query).toContain("NOT EXISTS");
    expect(query).toContain("FROM invitation_service_roles isr");
  });

  it("should not call invitationServices.destroy directly", async () => {
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
