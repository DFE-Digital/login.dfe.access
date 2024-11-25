const logger = require('../../infrastructure/logger');
const { getUserServices } = require('../../infrastructure/data');
const { formatDate } = require('../utils');

const listUserServices = async (req, res) => {
  const { uid } = req.params;
  const { correlationId } = req;

  logger.debug(`Listing services for user ${uid}`, { correlationId });
  try {
    const userServices = await getUserServices(uid) || [];

    if (userServices.length === 0) {
      return res.status(404).send();
    }

    return res.json(userServices.map((s) => {
      return Object.assign({}, s, { accessGrantedOn: formatDate(s.accessGrantedOn) });
    }));
  } catch (e) {
    logger.error(`Error listing services for user ${uid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = listUserServices;
