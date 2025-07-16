const { getUsersOfServicePaged } = require("./../../infrastructure/data");

const getQueryStringValue = (req, key) => {
  let paramsSource = req.method === "POST" ? req.body : req.query;
  const qsKey = Object.keys(paramsSource).find(
    (x) => x.toLowerCase() === key.toLowerCase(),
  );
  return qsKey ? paramsSource[qsKey] : undefined;
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
const getFilters = (req) => {
  let filters = undefined;

  const idkey = getQueryStringValue(req, "filteridkey");
  if (idkey) {
    filters = filters || {};
    filters.idkey = idkey;
  }

  const idvalue = getQueryStringValue(req, "filteridvalue");
  if (idvalue) {
    filters = filters || {};
    filters.idvalue = idvalue;
  }

  return filters;
};

const listUsersOfService = async (req, res) => {
  const page = getQueryStringIntValue(req, "page", 1);
  const pageSize = getQueryStringIntValue(req, "pageSize", 50);

  let userIds = undefined;

  if (req.method === "POST") {
    // userIds are in POST only, because if more than 119 ids are provided as a query
    // parameter, it will return a 431 status error.
    userIds = getQueryStringValue(req, "userIds");
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
