jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { Op } = require("sequelize");

const { getServiceRole } = require("./../../../src/infrastructure/data");

const roleCode = "TEST_ROLE_CODE";

describe("When getting a service role from repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should return the existing role if found", async () => {
    const mockRole = {
      id: "1234",
      name: "test role",
      code: roleCode,
      dataValues: { id: "1234", name: "test role", code: roleCode },
    };
    repository.roles.findOne.mockResolvedValue(mockRole);

    const actual = await getServiceRole(roleCode);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        code: { [Op.eq]: roleCode },
      },
    });
    expect(actual).toBe(mockRole);
  });

  it("should return undefined if role not found", async () => {
    repository.roles.findOne.mockResolvedValue(undefined);

    const actual = await getServiceRole(roleCode);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne).toHaveBeenCalledWith({
      where: {
        code: { [Op.eq]: roleCode },
      },
    });
    expect(actual).toBeUndefined();
  });
});
