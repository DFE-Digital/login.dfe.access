const { createServiceRole } = require("../../infrastructure/data");

const createRoleOfService = async (req, res) => {
  const { appId, roleName, roleCode } = req.body;

  if (!appId || !roleName || !roleCode) {
    return res
      .status(400)
      .json({ error: "Application id, role name, and role code are required" });
  }
  try {
    const newRole = await createServiceRole(appId, roleName, roleCode);
    return res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating service role:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = createRoleOfService;
