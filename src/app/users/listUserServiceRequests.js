const logger = require('../../infrastructure/logger');
const { getUserServiceRequests } = require('../../infrastructure/data');

const listUserServiceRequests = async (req, res) => {
  const uid = req.params.uid;
  const correlationId = req.correlationId;

  logger.info(`Listing services for user ${uid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const userServiceRequests = await getUserServiceRequests(uid) || [];

    if (userServiceRequests.length === 0) {
      return res.status(404).send();
    }

    return res.json(userServiceRequests);
  } catch (e) {
    logger.error(`Error getting service requests for user ${uid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = listUserServiceRequests;
