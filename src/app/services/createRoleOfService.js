const { createServiceRole } = require("../../infrastructure/data");

const createRoleOfService = async (req, res) => {
  // create row in roles table
  const newRole = await createServiceRole;
  return newRole;
};

module.exports = createRoleOfService;
