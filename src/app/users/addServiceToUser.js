const logger = require('./../../infrastructure/logger');
const { addUserService } = require('./../../infrastructure/data');

const addServiceToUser = async (req, res) => {
  const uid = req.params.uid;
  const sid = req.params.sid;
  const oid = req.body.organisation;
  const correlationId = req.correlationId;

  logger.info(`Adding service ${sid} with org ${oid} to user ${uid} (correlation id: ${correlationId})`, { correlationId });
  try {
    if (!oid) {
      return res.status(400).send({ message: 'Must specify organisation' });
    }

    await addUserService(uid, sid, oid);
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error adding service ${sid} with org ${oid} to user ${uid} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = addServiceToUser;
