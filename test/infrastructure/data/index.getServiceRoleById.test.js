jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { Op } = require("sequelize");

const { getServiceRoleById } = require("../../../src/infrastructure/data");

const appId = "1234";
const roleId = "role-1";

describe("When getting a service role from repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should return the existing role if found", async () => {
    const mockRole = {
      id: roleId,
      name: "test role",
      code: "TEST_ROLE_CODE",
      applicationId: appId,
      dataValues: { id: "role-1", name: "test role", code: "TEST_ROLE_CODE" },
    };
    repository.roles.findOne.mockResolvedValue(mockRole);

    const actual = await getServiceRoleById(appId, roleId);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        applicationId: { [Op.eq]: appId },
        id: { [Op.eq]: roleId },
      },
    });
    expect(actual).toBe(mockRole);
  });

  it("should return undefined if role not found", async () => {
    repository.roles.findOne.mockResolvedValue(undefined);

    const actual = await getServiceRoleById(appId, roleId);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne).toHaveBeenCalledWith({
      where: {
        applicationId: { [Op.eq]: appId },
        id: { [Op.eq]: roleId },
      },
    });
    expect(actual).toBeUndefined();
  });
});
