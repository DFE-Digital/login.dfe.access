jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { Op } = require("sequelize");
const {
  deleteUserServiceRolesByRoleId,
} = require("./../../../src/infrastructure/data");

describe("When deleting user service roles by role id", () => {
  const rid = "role-123";

  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should delete all user service roles with the given role id", async () => {
    await deleteUserServiceRolesByRoleId(rid);

    expect(repository.userServiceRoles.destroy).toHaveBeenCalledTimes(1);
    expect(repository.userServiceRoles.destroy).toHaveBeenCalledWith({
      where: {
        role_id: {
          [Op.eq]: rid,
        },
      },
    });
  });
});
