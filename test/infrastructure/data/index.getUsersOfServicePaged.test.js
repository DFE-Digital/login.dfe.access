jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);

const { mockUserServiceEntity } = require("./mockOrganisationsRepository");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const {
  getUsersOfServicePaged,
} = require("./../../../src/infrastructure/data");

const sid = "service-1";
const oid = "an-oid";
const filters = undefined;
const pageNumber = 2;
const pageSize = 25;
const services = [
  mockUserServiceEntity({}),
  mockUserServiceEntity({}, [
    { identifier_key: "k2s-id", identifier_value: "123456" },
  ]),
  mockUserServiceEntity({}, [
    { identifier_key: "groups", identifier_value: "g1,g2" },
  ]),
];

describe("When getting a page of users with access to service from repository - getUsersOfServicePaged", () => {
  beforeEach(() => {
    repository.mockResetAll();

    services[0].mockResetAll();
    services[1].mockResetAll();
    services[2].mockResetAll();
  });

  it("should correctly return services and page data on success", async () => {
    repository.connection.query
      .mockReturnValueOnce([{ count: 3 }])
      .mockReturnValue([services[0], services[1], services[2]]);
    const output = await getUsersOfServicePaged(
      sid,
      oid,
      undefined,
      filters,
      pageNumber,
      pageSize,
    );

    expect(repository.connection.query).toHaveBeenCalledTimes(2);
    expect(output).toHaveProperty(
      "services",
      "page",
      "totalNumberOfPages",
      "totalNumberOfRecords",
    );
    expect(output.services.length).toBe(3);
    expect(output.services[0]).toEqual({
      userId: undefined,
      invitationId: undefined,
      serviceId: services[0].service_id,
      organisationId: services[0].organisation_id,
      roles: [],
      identifiers: [],
      accessGrantedOn: services[0].createdAt,
    });
    expect(output.services[1]).toEqual({
      userId: undefined,
      invitationId: undefined,
      serviceId: services[1].service_id,
      organisationId: services[1].organisation_id,
      roles: [],
      identifiers: [{ key: "k2s-id", value: "123456" }],
      accessGrantedOn: services[1].createdAt,
    });
    expect(output.services[2]).toEqual({
      userId: undefined,
      invitationId: undefined,
      serviceId: services[2].service_id,
      organisationId: services[2].organisation_id,
      roles: [],
      identifiers: [{ key: "groups", value: "g1,g2" }],
      accessGrantedOn: services[2].createdAt,
    });
    expect(output.page).toBe(pageNumber);
    expect(output.totalNumberOfPages).toBe(1);
    expect(output.totalNumberOfRecords).toBe(3);
  });

  it("should calculate correct number of pages when returning multiple records", async () => {
    // 5 records and a pageSize of 2 should have 3 pages
    repository.connection.query
      .mockReturnValueOnce([{ count: 5 }])
      .mockReturnValue([
        services[0],
        services[1],
        services[2],
        services[2],
        services[1],
      ]);
    let output = await getUsersOfServicePaged(
      sid,
      oid,
      undefined,
      filters,
      pageNumber,
      2,
    );

    expect(repository.connection.query).toHaveBeenCalledTimes(2);
    expect(output.services.length).toBe(5);
    expect(output.page).toBe(pageNumber);
    expect(output.totalNumberOfPages).toBe(3);
    expect(output.totalNumberOfRecords).toBe(5);

    // 5 records and a pageSize of 3 should have 2 pages
    repository.connection.query.mockReset();
    repository.connection.query
      .mockReturnValueOnce([{ count: 5 }])
      .mockReturnValue([
        services[0],
        services[1],
        services[2],
        services[2],
        services[1],
      ]);
    output = await getUsersOfServicePaged(
      sid,
      oid,
      undefined,
      filters,
      pageNumber,
      3,
    );

    expect(repository.connection.query).toHaveBeenCalledTimes(2);
    expect(output.services.length).toBe(5);
    expect(output.page).toBe(pageNumber);
    expect(output.totalNumberOfPages).toBe(2);
    expect(output.totalNumberOfRecords).toBe(5);
  });
});
