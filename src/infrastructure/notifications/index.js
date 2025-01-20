const config = require("./../config");
const { ServiceNotificationsClient } = require("login.dfe.jobs-client");

const serviceNotificationsClient = new ServiceNotificationsClient(
  config.notifications,
);

const notifyUserUpdated = async (userId) => {
  const notificationsEnabled =
    config.toggles && config.toggles.notificationsEnabled === true;
  if (notificationsEnabled) {
    await serviceNotificationsClient.notifyUserUpdated({ sub: userId });
  }
};

module.exports = {
  notifyUserUpdated,
};
