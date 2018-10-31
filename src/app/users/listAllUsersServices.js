const logger = require('./../../infrastructure/logger');
const { getPageOfUserServices } = require('./../../infrastructure/data');
const { formatDate } = require('./../utils');

const listAllUsersServices = async (req, res) => {
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

  logger.info(`Listing page ${pageNumber} of user services (pageSize: ${pageSize}, correlation id: ${correlationId})`, { correlationId });
  try {
    const userServices = await getPageOfUserServices(pageNumber, pageSize) || [];

    if (userServices.services.length === 0) {
      return res.status(404).send();
    }

    return res.json({
      services: userServices.services.map(s => {
        return Object.assign({}, s, { accessGrantedOn: formatDate(s.accessGrantedOn) });
      }),
      numberOfPages: userServices.numberOfPages,
    });
  } catch (e) {
    logger.error(`Error listing page ${pageNumber} of user services (pageSize: ${pageSize}, correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = listAllUsersServices;
