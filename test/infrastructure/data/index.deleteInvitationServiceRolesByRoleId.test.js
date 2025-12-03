jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { Op } = require("sequelize");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const uuid = require("uuid");

const {
  deleteInvitationServiceRolesByRoleId,
} = require("../../../src/infrastructure/data/index.js");

describe("When deleting invitation service roles by role id", () => {
  const rid = uuid.v4();

  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should call invitationServiceRoles.destroy with the correct role id", async () => {
    await deleteInvitationServiceRolesByRoleId(rid);

    expect(repository.invitationServiceRoles.destroy).toHaveBeenCalledTimes(1);
    expect(repository.invitationServiceRoles.destroy).toHaveBeenCalledWith({
      where: {
        role_id: {
          [Op.eq]: rid,
        },
      },
    });
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("Database error");
    repository.invitationServiceRoles.destroy.mockRejectedValue(error);

    await expect(deleteInvitationServiceRolesByRoleId(rid)).rejects.toThrow(
      "Database error",
    );
  });
});
