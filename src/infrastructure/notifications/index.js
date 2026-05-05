const config = require("./../config");
const { ServiceNotificationsClient } = require("login.dfe.jobs-client");

const serviceNotificationsClient = new ServiceNotificationsClient(
  config.notifications,
);

const notifyUserUpdated = async (userId, serviceId, orgId) => {
  if (config.toggles && config.toggles.notificationsEnabled === true) {
    await serviceNotificationsClient.notifyUserUpdated({
      sub: userId,
      ...(serviceId && { removedServiceId: serviceId }),
      ...(orgId && { removedOrgId: orgId }),
    });
  }
};

module.exports = {
  notifyUserUpdated,
};
