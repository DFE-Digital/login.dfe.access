const logger = require('../../infrastructure/logger');
const { getInvitationServices } = require('../../infrastructure/data');

const listInvitationServices = async (req, res) => {
  const { iid } = req.params;
  const { correlationId } = req;

  logger.debug(`Listing services for invitation ${iid}`, { correlationId });
  try {
    const invitationServices = await getInvitationServices(iid) || [];

    if (invitationServices.length === 0) {
      return res.status(404).send();
    }

    return res.json(invitationServices);
  } catch (e) {
    logger.error(`Error listing services for invitation ${iid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};
module.exports = listInvitationServices;
