const logger = require('./../../infrastructure/logger');
const { getInvitationServices } = require('./../../infrastructure/data');

const listInvitationServices = async (req, res) => {
  const iid = req.params.iid;
  const correlationId = req.correlationId;

  logger.info(`Listing services for invitation ${iid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const invitationServices = await getInvitationServices(iid) || [];

    if (invitationServices.length === 0) {
      return res.status(404).send();
    }

    return res.json(invitationServices);
  } catch (e) {
    logger.error(`Error listing services for invitation ${iid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};
module.exports = listInvitationServices;
