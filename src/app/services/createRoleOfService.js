const { createServiceRole } = require("../../infrastructure/data");

const createRoleOfService = async (req, res) => {
  const { sid, roleName, roleCode } = req.body;

  if (!sid || !roleName || !roleCode) {
    return res
      .status(400)
      .json({ error: "sid, roleName, and roleCode are required" });
  }

  try {
    const newRole = await createServiceRole(sid, roleName, roleCode);
    return res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating service role:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = createRoleOfService;
