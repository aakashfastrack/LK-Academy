const { prisma } = require("../config/db");

const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  oldData = undefined,
  newData = null,
  description = "",
}) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,

        ...(oldData !== undefined && { oldData }),
        ...(newData !== undefined && { newData }),

        description,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  createAuditLog,
};
