const logger = require("../../infrastructure/logger");
const {
  getServiceRole,
  deleteServiceRole,
} = require("../../infrastructure/data");

const deleteRoleOfService = async (req, res) => {
  console.log("deleteRoleOfService deleteRoleOfService deleteRoleOfService");
  const { correlationId } = req;
  const { sid, rid } = req.params;

  logger.info(`Deleting role ${rid} for service ${sid}`, { correlationId });

  try {
    const existingRole = await getServiceRole(sid, rid);
    if (!existingRole || existingRole.id.toLowerCase() !== rid.toLowerCase()) {
      return res.status(404).send();
    }

    await deleteServiceRole(rid, sid);

    return res.status(204).send();
  } catch (e) {
    logger.error(`Error deleting role ${rid} for service ${sid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = deleteRoleOfService;
