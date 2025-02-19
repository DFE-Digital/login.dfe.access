jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const { addPolicy } = require("./../../../src/infrastructure/data");

const id = "policy-1";
const name = "Policy One";
const sid = "service-1";
const status = 1;

describe("When adding policy to service in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
  });

  it("then it should upsert record", async () => {
    await addPolicy(id, name, sid, status);

    expect(repository.policies.upsert).toHaveBeenCalledTimes(1);
    expect(repository.policies.upsert.mock.calls[0][0]).toMatchObject({
      id,
      name,
      applicationId: sid,
      status,
    });
  });
});
