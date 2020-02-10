const { getUsersOfServicePaged, getUsersOfServicePagedV2 } = require('./../../infrastructure/data');

const getPageNumber = (req) => {
  const pageValue = req.query.page;
  if (!pageValue) {
    return 1;
  }
  const page = parseInt(pageValue);
  if (isNaN(page)) {
    throw new Error('Page must be a number');
  } else if (page < 1) {
    throw new Error('Page must be at least 1');
  }
  return page;
};
const getPageSize = (req) => {
  const pageSizeValue = req.query.pageSize;
  if (!pageSizeValue) {
    return 25;
  }
  const page = parseInt(pageSizeValue);
  if (isNaN(page)) {
    throw new Error('Page size must be a number');
  } else if (page < 1) {
    throw new Error('Page size must be at least 1');
  }
  return page;
};

const listUsersOfServiceAtOrganisation = async (req, res) => {
  const { sid, oid } = req.params;
  let pageNumber;
  let pageSize;

  try {
    pageNumber = getPageNumber(req);
    pageSize = getPageSize(req);
  } catch (e) {
    return res.status(400).json({
      reasons: [e.message],
    });
  }

  const pageOfUserServices = await getUsersOfServicePaged(sid, oid, undefined, pageNumber, pageSize);
  return res.json(pageOfUserServices);
};

const listUsersOfServiceWithRoles = async (req, res) => {
  const { sid, oid } = req.params;
  const { roleIds } = req.query;
  let pageNumber;
  let pageSize;

  try {
    pageNumber = getPageNumber(req);
    pageSize = getPageSize(req);
  } catch (e) {
    return res.status(400).json({
      reasons: [e.message],
    });
  }

  const pageOfUserServices = await getUsersOfServicePagedV2(sid, oid, roleIds?roleIds.split(','):null, pageNumber, pageSize);
  return res.json(pageOfUserServices);
};
module.exports = {listUsersOfServiceAtOrganisation, listUsersOfServiceWithRoles}
