const logger = require('./../../infrastructure/logger');
const { getUserService } = require('./../../infrastructure/data');
const { formatDate } = require('./../utils');

const getSingleUserService = async (req, res) => {
  const uid = req.params.uid;
  const sid = req.params.sid;
  const oid = req.params.oid;
  const correlationId = req.correlationId;

  logger.info(`Getting service with id ${sid} in organisation ${oid} for user ${uid} (correlation id: ${correlationId})`, { correlationId });
  try {
    const userService = await getUserService(uid, sid, oid);

    if (!userService) {
      return res.status(404).send();
    }

    return res.json(Object.assign({}, userService, { accessGrantedOn: formatDate(userService.accessGrantedOn) }));
  } catch (e) {
    logger.error(`Error getting service with id ${sid} in organisation ${oid} for user ${uid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = getSingleUserService;
