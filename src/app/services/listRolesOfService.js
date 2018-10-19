const { getServiceRoles } = require('./../../infrastructure/data');

const listRolesOfService = async (req, res) => {
  const result = await getServiceRoles(req.params.sid);
  return res.json(result);
};

module.exports = listRolesOfService;
