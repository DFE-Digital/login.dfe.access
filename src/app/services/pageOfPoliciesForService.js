const logger = require("../../infrastructure/logger");
const { getPageOfPolicies } = require("../../infrastructure/data");

const getQueryStringValue = (req, key) => {
  const qsKey = Object.keys(req.query).find(
    (x) => x.toLowerCase() === key.toLowerCase(),
  );
  return qsKey ? req.query[qsKey] : undefined;
};
const getQueryStringIntValue = (req, key, defaultValue = 0) => {
  const value = getQueryStringValue(req, key);
  if (!value) {
    return defaultValue;
  }

  const int = parseInt(value, 10);
  if (isNaN(int)) {
    throw new Error(`${key} must be a number`);
  }
  return int;
};

const getPageOfPoliciesForService = async (req, res) => {
  const page = getQueryStringIntValue(req, "page", 1);
  const pageSize = getQueryStringIntValue(req, "pageSize", 50);

  const { correlationId } = req;
  const { sid } = req.params;

  logger.debug(`Getting policies for service ${sid}`, { correlationId });
  try {
    const policies = await getPageOfPolicies(sid, page, pageSize);

    return res.json(policies);
  } catch (e) {
    logger.error(`Error getting policies for service ${sid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = getPageOfPoliciesForService;
