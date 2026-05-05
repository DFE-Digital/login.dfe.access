const mockNotifyUserUpdatedFn = jest.fn();

jest.mock("login.dfe.jobs-client", () => ({
  ServiceNotificationsClient: jest.fn().mockImplementation(() => ({
    notifyUserUpdated: mockNotifyUserUpdatedFn,
  })),
}));

jest.mock("./../../../src/infrastructure/config", () => ({
  notifications: {},
  toggles: { notificationsEnabled: true },
}));

const {
  notifyUserUpdated,
} = require("./../../../src/infrastructure/notifications");
const config = require("./../../../src/infrastructure/config");

describe("notifyUserUpdated", () => {
  beforeEach(() => {
    mockNotifyUserUpdatedFn.mockReset();
    config.toggles.notificationsEnabled = true;
  });

  it("forwards removedServiceId and removedOrgId when both are provided", async () => {
    await notifyUserUpdated("user-123", "service-456", "org-789");

    expect(mockNotifyUserUpdatedFn).toHaveBeenCalledTimes(1);
    expect(mockNotifyUserUpdatedFn).toHaveBeenCalledWith({
      sub: "user-123",
      removedServiceId: "service-456",
      removedOrgId: "org-789",
    });
  });

  it("sends only sub when called with one argument (backward compatibility)", async () => {
    await notifyUserUpdated("user-123");

    expect(mockNotifyUserUpdatedFn).toHaveBeenCalledTimes(1);
    const callArg = mockNotifyUserUpdatedFn.mock.calls[0][0];
    expect(callArg).toEqual({ sub: "user-123" });
    expect(callArg).not.toHaveProperty("removedServiceId");
    expect(callArg).not.toHaveProperty("removedOrgId");
  });

  it("handles partial arguments correctly", async () => {
    await notifyUserUpdated("user-123", "service-456");

    expect(mockNotifyUserUpdatedFn).toHaveBeenCalledTimes(1);
    const callArg = mockNotifyUserUpdatedFn.mock.calls[0][0];
    expect(callArg).toEqual({
      sub: "user-123",
      removedServiceId: "service-456",
    });
    expect(callArg).not.toHaveProperty("removedOrgId");
  });

  it("does not call serviceNotificationsClient.notifyUserUpdated when notifications are disabled", async () => {
    config.toggles.notificationsEnabled = false;

    await notifyUserUpdated("user-123", "service-456", "org-789");

    expect(mockNotifyUserUpdatedFn).not.toHaveBeenCalled();
  });
});
