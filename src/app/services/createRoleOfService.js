const { createServiceRole } = require("../../infrastructure/data");
const logger = require("../../infrastructure/logger");
const { validate } = require("uuid");

const createRoleOfService = async (req, res) => {
  const { appId, roleName, roleCode } = req.body;

  if (!appId || !roleName || !roleCode) {
    return res
      .status(400)
      .send({ error: "Application id, role name, and role code are required" });
  }

  if (!validate(appId)) {
    return res.status(400).send({ error: "Invalid application id format" });
  }

  if (roleName.length > 125) {
    return res
      .status(400)
      .send({ error: "Role name must be 125 characters or less" });
  }

  if (roleCode.length > 50) {
    return res
      .status(400)
      .send({ error: "Role code must be 50 characters or less" });
  }

  try {
    const role = await createServiceRole(appId, roleName, roleCode);
    return res.status(role.statusCode).send(role.role);
  } catch (error) {
    logger.error(`Error creating service role for: ${appId}`, { error });
    return res.status(500).send({ error: "Failed to create service role" });
  }
};

module.exports = createRoleOfService;
