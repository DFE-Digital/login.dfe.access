jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { deletePolicy } = require("./../../../src/infrastructure/data");
const { Op } = require("sequelize");

const pid = "policy-1";

describe("When deleting policy in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should delete record based on id", async () => {
    await deletePolicy(pid);

    expect(repository.policies.destroy).toHaveBeenCalledTimes(1);
    expect(repository.policies.destroy.mock.calls[0][0]).toMatchObject({
      where: {
        id: {
          [Op.eq]: pid,
        },
      },
    });
  });
});
