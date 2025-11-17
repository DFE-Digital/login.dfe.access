const logger = require("../../infrastructure/logger");
const {
  deleteServiceRole,
  getServiceRoleById,
} = require("../../infrastructure/data");

const deleteRoleOfService = async (req, res) => {
  const { correlationId } = req;
  const { sid, rid } = req.params;

  try {
    const existingRole = await getServiceRoleById(sid, rid);

    if (!existingRole) {
      logger.info(
        `Could not find requested role to be deleted for service ${sid}`,
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
