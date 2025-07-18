const { getUsersOfServicePaged } = require("./../../infrastructure/data");

/**
 * Gets a value from the request object by using the supplied key.  If the
 * request has a POST method, then it will get it from the body.  If the
 * request has a GET method then it will get it from the query
 *
 * @param {*} req The request object
 * @param {String} key The key to get the value out of the body or query
 */
const getValueFromRequest = (req, key) => {
  let paramsSource = req.method === "POST" ? req.body : req.query;
  const qsKey = Object.keys(paramsSource).find(
    (x) => x.toLowerCase() === key.toLowerCase(),
  );
  return qsKey ? paramsSource[qsKey] : undefined;
};

/**
 * Gets a value from the request object by using the supplied key. The value will be
 * converted into a number.  If the value cannot be converted into a number, an
 * exception will be raised.
 * If the request has a POST method, then it will get it from the body.  If the
 * request has a GET method then it will get it from the query
 *
 * @param {*} req The request object
 * @param {String} key The key to get the value out of the body or query
 * @param {number} defaultValue - An optional default if the key is missing from the request
 */
const getIntValueFromRequest = (req, key, defaultValue = 0) => {
  const value = getValueFromRequest(req, key);
  if (!value) {
    return defaultValue;
  }

  const int = parseInt(value);
  if (isNaN(int)) {
    throw new Error(`${key} must be a number`);
  }
  return int;
};

const getFilters = (req) => {
  let filters = undefined;

  const idkey = getValueFromRequest(req, "filteridkey");
  if (idkey) {
    filters = filters || {};
    filters.idkey = idkey;
  }

  const idvalue = getValueFromRequest(req, "filteridvalue");
  if (idvalue) {
    filters = filters || {};
    filters.idvalue = idvalue;
  }

  return filters;
};

const listUsersOfService = async (req, res) => {
  const page = getIntValueFromRequest(req, "page", 1);
  const pageSize = getIntValueFromRequest(req, "pageSize", 50);

  let userIds = undefined;

  if (req.method === "POST") {
    // userIds are in POST only, because if more than 119 ids are provided as a query
    // parameter, it will return a 431 status error.
    userIds = getValueFromRequest(req, "userIds");
  }
  const filters = getFilters(req);

  const result = await getUsersOfServicePaged(
    req.params.sid,
    undefined,
    userIds,
    filters,
    page,
    pageSize,
  );
  return res.json(result);
};

module.exports = listUsersOfService;
