const { createServiceRole } = require("../../infrastructure/data");
const logger = require("../../infrastructure/logger");

const createRoleOfService = async (req, res) => {
  const { appId, roleName, roleCode } = req.body;

  if (!appId || !roleName || !roleCode) {
    return res
      .status(400)
      .send({ error: "Application id, role name, and role code are required" });
  }
  try {
    const newRole = await createServiceRole(appId, roleName, roleCode);
    return res.status(201).send(newRole);
  } catch (error) {
    logger.error(`Error creating service role for: ${appId}`, { error });
    return res.status(500).send({ error: "Failed to create service role" });
  }
};

module.exports = createRoleOfService;
