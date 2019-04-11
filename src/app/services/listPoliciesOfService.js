const logger = require('./../../infrastructure/logger');
const { getPoliciesForService } = require('./../../infrastructure/data');

const getQueryStringValue = (req, key) => {
  const qsKey = Object.keys(req.query).find(x => x.toLowerCase() === key.toLowerCase());
  return qsKey ? req.query[qsKey] : undefined;
};
const getQueryStringIntValue = (req, key, defaultValue = 0) => {
  const value = getQueryStringValue(req, key);
  if (!value) {
    return defaultValue;
  }

  const int = parseInt(value);
  if (isNaN(int)) {
    throw new Error(`${key} must be a number`);
  }
  return int;
};

const listPoliciesOfService = async (req, res) => {
  const page = getQueryStringIntValue(req, 'page', 1);
  const pageSize = getQueryStringIntValue(req, 'pageSize', 100000);

  const correlationId = req.correlationId;
  const { sid } = req.params;

  logger.info(`Getting policies for service ${sid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const policies = await getPoliciesForService(sid, page, pageSize);

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
