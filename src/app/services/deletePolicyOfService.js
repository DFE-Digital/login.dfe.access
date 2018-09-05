const logger = require('./../../infrastructure/logger');
const { getPolicy, deletePolicy, deletePolicyConditions, deletePolicyRoles } = require('./../../infrastructure/data');

const deletePolicyOfService = async (req, res) => {
  const correlationId = req.correlationId;
  const { sid, pid } = req.params;

  logger.info(`Deleting policy ${pid} for service ${sid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const existingPolicy = await getPolicy(pid);
    if (!existingPolicy || existingPolicy.applicationId.toLowerCase() !== sid.toLowerCase()) {
      return res.status(404).send();
    }

    await deletePolicyConditions(pid);
    await deletePolicyRoles(pid);
    await deletePolicy(pid);

    return res.status(204).send();
  } catch (e) {
    logger.error(`Error deleting policy ${pid} for service ${sid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = deletePolicyOfService;