jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);
jest.mock("uuid");

const uuid = require("uuid");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const {
  removeAllInvitationServiceIdentifiers,
} = require("./../../../src/infrastructure/data");
const { Op } = require("sequelize");

const iid = "user-1";
const sid = "service-1";
const oid = "organisation-1";

describe("When removing identifiers to a invitation service in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.v4.mockReset().mockReturnValue("new-uuid");
  });

  it("then it should remove all records", async () => {
    await removeAllInvitationServiceIdentifiers(iid, sid, oid);

    expect(
      repository.invitationServiceIdentifiers.destroy,
    ).toHaveBeenCalledTimes(1);
    expect(
      repository.invitationServiceIdentifiers.destroy.mock.calls[0][0],
    ).toMatchObject({
      where: {
        invitation_id: {
          [Op.eq]: iid,
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
