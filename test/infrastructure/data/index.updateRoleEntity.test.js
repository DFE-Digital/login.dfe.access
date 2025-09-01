jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { updateRoleEntity } = require("../../../src/infrastructure/data");

// existingEntity would usually be a Sequelize model object, but simulating the .update function
// on it is good enough for this test
const existingEntity = {
  id: "role-1",
  name: "role-name-1",
  code: "role-code-1",
  status: 1,
  createdAt: "2025-06-29T11:29:39.064Z",
  updatedAt: "2025-06-29T11:31:18.285Z",
  update: jest.fn(),
};

const role = {
  name: "new-role-name-1",
  code: "new-role-code-1",
};

describe("When updating a role entity in the repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should update the record", async () => {
    await updateRoleEntity(existingEntity, role);
    expect(existingEntity.update).toHaveBeenCalledTimes(1);
    expect(existingEntity.update.mock.calls[0][0]).toEqual({
      name: "new-role-name-1",
      code: "new-role-code-1",
    });
  });
});
