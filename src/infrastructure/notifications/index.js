const config = require('./../config');
const ServiceNotificationsClient = require('login.dfe.service-notifications.jobs.client');

const serviceNotificationsClient = new ServiceNotificationsClient(config.notifications);

const notifyUserUpdated = async (userId) => {
  await serviceNotificationsClient.notifyUserUpdated({ sub: userId });
};

module.exports = {
  notifyUserUpdated,
};
