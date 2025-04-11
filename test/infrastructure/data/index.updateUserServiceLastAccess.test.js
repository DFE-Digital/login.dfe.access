jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);
jest.mock("uuid");

const uuid = require("uuid");
const repository = require("../../../src/infrastructure/data/organisationsRepository");

const {
  updateUserServiceLastAccess,
} = require("../../../src/infrastructure/data");
const { Op } = require("sequelize");

const uid = "user-1";
const sid = "service-1";
const oid = "organisation-1";

describe("When adding user to service in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();
    uuid.v4.mockReset().mockReturnValue("new-uuid");
  });

  it("should update the record with the timestamp if the record exists", async () => {
    const mockDbObject = {
      id: "123456",
      update: jest.fn(),
    };
    repository.userServices.findOne.mockReturnValue(mockDbObject);

    const actual = await updateUserServiceLastAccess(uid, sid, oid);

    expect(actual).toEqual("123456");
    expect(repository.userServices.findOne).toHaveBeenCalledTimes(1);
    expect(mockDbObject.update).toHaveBeenCalledTimes(1);
    expect(mockDbObject.update.mock.calls[0][0]).toMatchObject({
      lastAccessed: { val: "CURRENT_TIMESTAMP" },
    });
  });

  it("should return undefined if a record cannot be found", async () => {
    repository.userServices.findOne.mockReturnValue(null);

    const actual = await updateUserServiceLastAccess(uid, sid, oid);

    expect(actual).toEqual(undefined);
    expect(repository.userServices.findOne).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
        },
        service_id: {
          [Op.eq]: sid,
        },
        organisation_id: {
          [Op.eq]: oid,
        },
      },
    });
  });
});
