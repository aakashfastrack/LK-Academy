const { prisma } = require("../../config/db");

const createBranch = async (name, userId) => {
  if (!userId) {
    return await prisma.branch.create({
      data: { name },
    });
  } else {
    return await prisma.branch.create({
      data: { name, userId: userId },
    });
  }
};

const getAllBranch = async () => {
  return await prisma.branch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          role: true,
        },
      },
      courses: {
        include: {
          batches: {
            include: {
              lectureSchedules: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getBranchById = async (id) => {
  return await prisma.branch.findUnique({
    where: { id: Number(id) },
    include: {
      users: true,
      courses: {
        include: {
          batches: {
            include: {
              lectureSchedules: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const updateBranch = async (id, name) => {
  return await prisma.branch.update({
    where: { id: Number(id) },
    data: { name },
  });
};

const deleteBranch = async (id) => {
  return await prisma.branch.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createBranch,
  getAllBranch,
  getBranchById,
  updateBranch,
  deleteBranch,
};
