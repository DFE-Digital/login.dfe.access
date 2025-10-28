const logger = require("../../infrastructure/logger");
const {
  getServiceRole,
  deleteServiceRole,
} = require("../../infrastructure/data");

const deleteRoleOfService = async (req, res) => {
  const { correlationId } = req;
  const { sid, rid } = req.params;
  const model = req.body;
  console.log("req.body: ", model);

  // console.log("code: ", code);
  // console.log("rid: ", rid);
  // console.log("sid: ", sid);

  logger.info(`Deleting role ${rid} for service ${sid}`, { correlationId });
  // return res.status(200).send(); //! remove

  try {
    const existingRole = await getServiceRole(model.appId, model.roleCode);
    console.log("existingRole: ", existingRole);
    // if (
    //   !existingPolicy ||
    //   existingPolicy.applicationId.toLowerCase() !== sid.toLowerCase()
    // ) {
    if (!existingRole) {
      return res.status(404).send();
    }
    // appId, roleName, roleCode
    await deleteServiceRole(model);
    //   await deletePolicyConditions(pid);
    //   await deletePolicyRoles(pid);
    //   await deletePolicy(pid);

    return res.status(204).send();
  } catch (e) {
    logger.error(`Error deleting role ${rid} for service ${sid}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = deleteRoleOfService;
