jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { addPolicyCondition } = require("./../../../src/infrastructure/data");

const id = "condition-1";
const pid = "policy-1";
const field = "id";
const operator = "Is";
const value = "123456";

describe("When adding condition to policy in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should upsert record", async () => {
    await addPolicyCondition(id, pid, field, operator, value);

    expect(repository.policyConditions.upsert).toHaveBeenCalledTimes(1);
    expect(repository.policyConditions.upsert.mock.calls[0][0]).toMatchObject({
      id,
      policyId: pid,
      field,
      operator,
      value,
    });
  });
});
