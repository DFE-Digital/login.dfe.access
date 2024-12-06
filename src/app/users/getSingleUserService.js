const logger = require("../../infrastructure/logger");
const { getUserService } = require("../../infrastructure/data");
const { formatDate } = require("../utils");

const getSingleUserService = async (req, res) => {
  const { uid } = req.params;
  const { sid } = req.params;
  const { oid } = req.params;
  const { correlationId } = req;

  logger.debug(
    `Getting service with id ${sid} in organisation ${oid} for user ${uid}`,
    { correlationId },
  );
  try {
    const userService = await getUserService(uid, sid, oid);

    if (!userService) {
      return res.status(404).send();
    }

    return res.json(
      Object.assign({}, userService, {
        accessGrantedOn: formatDate(userService.accessGrantedOn),
      }),
    );
  } catch (e) {
    logger.error(
      `Error getting service with id ${sid} in organisation ${oid} for user ${uid}`,
      {
        correlationId,
        error: { ...e },
      },
    );
    throw e;
  }
};

module.exports = getSingleUserService;
