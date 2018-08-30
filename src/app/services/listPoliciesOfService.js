const logger = require('./../../infrastructure/logger');
const { getPoliciesForService } = require('./../../infrastructure/data');

const listPoliciesOfService = async (req, res) => {
  const correlationId = req.correlationId;
  const { sid } = req.params;

  logger.info(`Getting policies for service ${sid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const policies = await getPoliciesForService(sid);

    return res.json(policies);
  } catch (e) {
    logger.error(`Error getting policies for service ${sid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = listPoliciesOfService;
