jest.mock("login.dfe.jobs-client");
jest.mock("./../../../src/infrastructure/config", () =>
  require("./../../utils").mockConfig({
    toggles: { notificationsEnabled: true },
  }),
);

const { ServiceNotificationsClient } = require("login.dfe.jobs-client");
const mockNotifyUserUpdated = jest.fn().mockResolvedValue();
ServiceNotificationsClient.mockImplementation(() => ({
  notifyUserUpdated: mockNotifyUserUpdated,
}));

const {
  notifyUserUpdated,
} = require("./../../../src/infrastructure/notifications");

beforeEach(() => {
  mockNotifyUserUpdated.mockClear();
});

describe("When notifying user updated", () => {
  it("passes only sub when no removal IDs are supplied", async () => {
    await notifyUserUpdated("user-1");
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({ sub: "user-1" });
  });

  it("passes sub, removedServiceId, and removedOrgId when all three are supplied", async () => {
    await notifyUserUpdated("user-1", "svc-1", "org-1");
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({
      sub: "user-1",
      removedServiceId: "svc-1",
      removedOrgId: "org-1",
    });
  });

  it("passes sub and removedServiceId when only removedServiceId is supplied", async () => {
    await notifyUserUpdated("user-1", "svc-1");
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({
      sub: "user-1",
      removedServiceId: "svc-1",
    });
  });

  it("passes sub and removedOrgId when only removedOrgId is supplied", async () => {
    await notifyUserUpdated("user-1", undefined, "org-1");
    expect(mockNotifyUserUpdated).toHaveBeenCalledWith({
      sub: "user-1",
      removedOrgId: "org-1",
    });
  });

  it("does not call the client when notifications are disabled", async () => {
    jest.resetModules();
    jest.mock("./../../../src/infrastructure/config", () =>
      require("./../../utils").mockConfig({
        toggles: { notificationsEnabled: false },
      }),
    );
    const {
      notifyUserUpdated: fn,
    } = require("./../../../src/infrastructure/notifications");
    await fn("user-1", "svc-1", "org-1");
    expect(mockNotifyUserUpdated).not.toHaveBeenCalled();
  });
});
