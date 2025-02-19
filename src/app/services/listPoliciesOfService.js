const logger = require("../../infrastructure/logger");
const { getPoliciesForService } = require("../../infrastructure/data");

const listPoliciesOfService = async (req, res) => {
  const { correlationId } = req;
  const { sid } = req.params;

  logger.debug(`Getting policies for service ${sid}`, { correlationId });
  try {
    const policies = await getPoliciesForService(sid);

    return res.json(policies);
  } catch (e) {
    logger.error(`Error getting policies for service ${sid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = listPoliciesOfService;
