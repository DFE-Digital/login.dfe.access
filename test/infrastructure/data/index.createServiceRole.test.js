jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);
jest.mock("uuid");

const uuid = require("uuid");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { Op, Sequelize } = require("sequelize");

Sequelize.literal = jest.fn((val) => val);

const { createServiceRole } = require("./../../../src/infrastructure/data");

const appId = "1234";
const roleName = "test role";
const roleCode = "test role code";

describe("When creating a manage service role", () => {
  beforeEach(() => {
    repository.mockResetAll();
    uuid.v4.mockReset().mockReturnValue("new-role-uuid");
  });

  it("should return an existing role and statusCode 409 if the role already exists", async () => {
    const existingRole = {
      dataValues: {
        id: "existing-id",
        name: roleName,
        applicationId: appId,
        code: roleCode,
      },
    };
    repository.roles.findOne.mockReturnValue(existingRole);

    const actual = await createServiceRole(appId, roleName, roleCode);

    expect(actual).toEqual({
      role: existingRole.dataValues,
      statusCode: 409,
    });
    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        code: { [Op.eq]: roleCode },
      },
    });
    expect(repository.roles.create).not.toHaveBeenCalled();
  });

  it("should create a new role and return statusCode 201 if the role does not already exist", async () => {
    repository.roles.findOne.mockReturnValue(undefined);
    const createdRole = {
      dataValues: {
        id: "new-role-uuid",
        name: roleName,
        applicationId: appId,
        status: 1,
        code: roleCode,
      },
    };
    repository.roles.create.mockReturnValue(createdRole);

    const actual = await createServiceRole(appId, roleName, roleCode);

    expect(actual).toEqual({
      role: createdRole.dataValues,
      statusCode: 201,
    });
    expect(repository.roles.findOne).toHaveBeenCalledTimes(1);
    expect(repository.roles.create).toHaveBeenCalledTimes(1);
    expect(repository.roles.create.mock.calls[0][0]).toMatchObject({
      id: "new-role-uuid",
      name: roleName,
      applicationId: appId,
      status: 1,
      code: roleCode,
      numericId: "NEXT VALUE FOR role_numeric_id_sequence",
    });
  });
});
