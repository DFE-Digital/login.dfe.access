const logger = require('../../infrastructure/logger');
const { getInvitationService } = require('../../infrastructure/data');

const getSingleInvitationService = async (req, res) => {
  const { iid } = req.params;
  const { sid } = req.params;
  const { oid } = req.params;
  const { correlationId } = req;

  logger.debug(`Getting service with id ${sid} in organisation ${oid} for invitation ${iid}`, { correlationId });
  try {
    const invitationService = await getInvitationService(iid, sid, oid);

    if (!invitationService) {
      return res.status(404).send();
    }

    return res.json(invitationService);
  } catch (e) {
    logger.error(`Error getting service with id ${sid} in organisation ${oid} for invitation ${iid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = getSingleInvitationService;
