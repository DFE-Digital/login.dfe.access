const logger = require("../../infrastructure/logger");
const { getUserServiceRequests } = require("../../infrastructure/data");

const listUserServiceRequests = async (req, res) => {
  const { uid } = req.params;
  const { correlationId } = req;

  logger.debug(`Listing services for user ${uid}`, { correlationId });
  try {
    const userServiceRequests = (await getUserServiceRequests(uid)) || [];

    if (userServiceRequests.length === 0) {
      return res.status(404).send();
    }

    return res.json(userServiceRequests);
  } catch (e) {
    logger.error(`Error getting service requests for user ${uid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = listUserServiceRequests;
