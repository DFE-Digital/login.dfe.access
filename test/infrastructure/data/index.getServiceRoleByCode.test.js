jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("../../../src/infrastructure/data/organisationsRepository");
const { Op } = require("sequelize");

const { getServiceRoleByCode } = require("../../../src/infrastructure/data");

const appId = "1234";
const roleCode = "TEST_ROLE_CODE";

describe("When getting a service role from repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("should return the existing role if found", async () => {
    const mockRole = {
      id: "role-1",
      name: "test role",
      code: roleCode,
      applicationId: appId,
      dataValues: { id: "role-1", name: "test role", code: roleCode },
    };
    repository.roles.findOne.mockResolvedValue(mockRole);

    const actual = await getServiceRoleByCode(appId, roleCode);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        applicationId: { [Op.eq]: appId },
        code: { [Op.eq]: roleCode },
      },
    });
    expect(actual).toBe(mockRole);
  });

  it("should return undefined if role not found", async () => {
    repository.roles.findOne.mockResolvedValue(undefined);

    const actual = await getServiceRoleByCode(appId, roleCode);

    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne).toHaveBeenCalledWith({
      where: {
        applicationId: { [Op.eq]: appId },
        code: { [Op.eq]: roleCode },
      },
    });
    expect(actual).toBeUndefined();
  });
});
