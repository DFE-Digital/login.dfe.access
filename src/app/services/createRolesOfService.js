const { createServiceRole } = require("../../infrastructure/data");

const createRolesOfService = async (req, res) => {
  // create row in roles table
  const newRole = await createServiceRole;
};

module.exports = createRolesOfService;
