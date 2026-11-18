const mockNotifyUserUpdated = jest.fn();

jest.mock("./../../../src/infrastructure/config", () => ({
  notifications: { connectionString: "redis://localhost" },
  toggles: { notificationsEnabled: true },
}));
jest.mock("login.dfe.jobs-client", () => ({
  ServiceNotificationsClient: jest.fn().mockImplementation(() => ({
    notifyUserUpdated: (...args) => mockNotifyUserUpdated(...args),
  })),
}));

const {
  notifyUserUpdated,
} = require("./../../../src/infrastructure/notifications");

describe("When notifying that a user was updated", () => {
  beforeEach(() => {
    mockNotifyUserUpdated.mockReset();
  });

  it("then it should send only the sub when no removed ids are given", async () => {
    await notifyUserUpdated("user-1");

    expect(mockNotifyUserUpdated).toHaveBeenCalledTimes(1);
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({ sub: "user-1" });
  });

  it("then it should include removed service and org ids when given", async () => {
    await notifyUserUpdated("user-1", "service-1", "org-1");

    expect(mockNotifyUserUpdated).toHaveBeenCalledTimes(1);
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({
      sub: "user-1",
      removedServiceId: "service-1",
      removedOrgId: "org-1",
    });
  });
});
