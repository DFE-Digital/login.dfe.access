jest.mock("./../../../src/infrastructure/data/organisationsRepository", () =>
  require("./mockOrganisationsRepository").mockRepository(),
);
jest.mock("uuid");

const uuid = require("uuid");
const repository = require("./../../../src/infrastructure/data/organisationsRepository");
const {
  removeAllInvitationServiceRoles,
} = require("./../../../src/infrastructure/data");
const { Op } = require("sequelize");

const iid = "invitation-1";
const sid = "service-1";
const oid = "organisation-1";

describe("When removing roles from a invitation service in repository", () => {
  beforeEach(() => {
    repository.mockResetAll();

    uuid.v4.mockReset().mockReturnValue("new-uuid");
  });

  it("then it should destroy all records for invitation/service/org", async () => {
    await removeAllInvitationServiceRoles(iid, sid, oid);

    expect(repository.invitationServiceRoles.destroy).toHaveBeenCalledTimes(1);
    expect(
      repository.invitationServiceRoles.destroy.mock.calls[0][0],
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
