const logger = require("../../infrastructure/logger");
const {
  getServiceRole,
  deleteServiceRole,
} = require("../../infrastructure/data");

const deleteRoleOfService = async (req, res) => {
  const { correlationId } = req;
  const { sid, rid } = req.params;
  const code = req.query?.roleCode;

  try {
    const existingRole = await getServiceRole(sid, code);

    if (!existingRole) {
      logger.info(
        `Could not find requested role to be deleted for service ${sid}`,
        {
          correlationId,
        },
      );
      return res.status(404).send();
    }
    if (existingRole && existingRole.id.toLowerCase() !== rid.toLowerCase()) {
      logger.info(
        `Role deletion failed. Role id mismatch: [Request: ${rid.toLowerCase()}] - [Existing: ${existingRole.id.toLowerCase()}]`,
        {
          correlationId,
        },
      );
      return res.status(404).send();
    }

    logger.info(`Deleting role ${rid} for service ${sid}`, { correlationId });
    await deleteServiceRole(sid, rid);

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
