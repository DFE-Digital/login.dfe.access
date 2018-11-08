const logger = require('./../../infrastructure/logger');
const { getInvitationService } = require('./../../infrastructure/data');

const getSingleInvitationService = async (req, res) => {
  const iid = req.params.iid;
  const sid = req.params.sid;
  const oid = req.params.oid;
  const correlationId = req.correlationId;

  logger.info(`Getting service with id ${sid} in organisation ${oid} for invitation ${iid} (correlation id: ${correlationId})`, {correlationId});
  try {
    const invitationService = await getInvitationService(iid, sid, oid);

    if (!invitationService) {
      return res.status(404).send();
    }

    return res.json(invitationService);
  } catch (e) {
    logger.error(`Error getting service with id ${sid} in organisation ${oid} for invitation ${iid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = getSingleInvitationService;
