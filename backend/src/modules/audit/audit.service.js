const { prisma } = require("../../config/db");

const getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  getAuditLogs,
};
