jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { mockRoleEntity } = require("./mockOrganisationsRepository");
const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { getRole } = require("../../../src/infrastructure/data");
const { Op } = require("sequelize");

const roleId = "role-1";
const role = mockRoleEntity();

describe("When getting roles of service from the repository", () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.roles.findOne.mockReturnValue(role);

    role.mockResetAll();
  });

  it("then it should find for id", async () => {
    const actual = await getRole(roleId);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        Id: {
          [Op.eq]: roleId,
        },
      },
    });

    expect(actual).toBe(role);
  });

  it("then it should return undefined if no records found", async () => {
    repository.roles.findOne.mockReturnValue(undefined);

    const actual = await getRole(roleId);

    expect(actual).toEqual(undefined);
  });
});
