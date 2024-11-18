const logger = require('../../infrastructure/logger');
const { getPolicy } = require('../../infrastructure/data');

const getPolicyOfService = async (req, res) => {
  const { correlationId } = req;
  const { sid, pid } = req.params;

  logger.debug(`Getting policy ${pid} for service ${sid}`, { correlationId });
  try {
    const policy = await getPolicy(pid);

    if (!policy || policy.applicationId.toLowerCase() !== sid.toLowerCase()) {
      return res.status(404).send();
    }

    return res.json(policy);
  } catch (e) {
    logger.error(`Error getting policy ${pid} for service ${sid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = getPolicyOfService;
