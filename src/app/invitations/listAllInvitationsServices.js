const logger = require('./../../infrastructure/logger');
const { getPageOfInvitationServices } = require('./../../infrastructure/data');

const listAllInvitationsServices = async (req, res) => {
  const pageNumber = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 100;
  const correlationId = req.correlationId;

  if (isNaN(pageNumber)) {
    return res.status(400).json({
      reason: 'page number be a number',
    });
  }
  if (isNaN(pageSize)) {
    return res.status(400).json({
      reason: 'pageSize number be a number',
    });
  }

  logger.info(`Listing page ${pageNumber} of invitation services (pageSize: ${pageSize}, correlation id: ${correlationId})`, { correlationId });
  try {
    const invitationServices = await getPageOfInvitationServices(pageNumber, pageSize) || [];

    if (invitationServices.services.length === 0) {
      return res.status(404).send();
    }

    return res.json(invitationServices);
  } catch (e) {
    logger.error(`Error listing page ${pageNumber} services (pageSize: ${pageSize}, correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = listAllInvitationsServices;
