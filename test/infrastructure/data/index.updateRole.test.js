jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { updateRole } = require("../../../src/infrastructure/data");

const roleId = "role-1";

const newRoleData = {
  name: "new-role-name-1",
  code: "new-role-code-1",
};

describe("When updating a role entity in the repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should update the record", async () => {
    await updateRole(roleId, newRoleData);
    expect(repository.roles.update).toHaveBeenCalledTimes(1);
    expect(repository.roles.update.mock.calls[0][0]).toEqual({
      name: "new-role-name-1",
      code: "new-role-code-1",
    });
    expect(repository.roles.update.mock.calls[0][1]).toEqual({
      where: { id: "role-1" },
    });
  });
});
