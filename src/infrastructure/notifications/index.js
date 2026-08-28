const config = require("./../config");
const { ServiceNotificationsClient } = require("login.dfe.jobs-client");

const serviceNotificationsClient = new ServiceNotificationsClient(
  config.notifications,
);

const notifyUserUpdated = async (userId, removedServiceId, removedOrgId) => {
  const notificationsEnabled =
    config.toggles && config.toggles.notificationsEnabled === true;
  if (notificationsEnabled) {
    await serviceNotificationsClient.notifyUserUpdated({
      sub: userId,
      ...(removedServiceId && { removedServiceId }),
      ...(removedOrgId && { removedOrgId }),
    });
  }
};

module.exports = {
  notifyUserUpdated,
};
