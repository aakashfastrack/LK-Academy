const { prisma } = require("../../config/db");

const assignUserToBranch = async (userId, branchId, currentUser) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  if (currentUser.role === "BRANCH_ADMIN") {
    if (branchId !== currentUser.branchId) {
      throw new Error("You can assign users only to your branch");
    }
    if (user.role === "SUPER_ADMIN") {
      throw new Error("Not allowed");
    }
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { branchId },
  });
};

const bulkAssignUsersToBranch = async (userIds, branchId, currentUser) => {
  const updated = [];
  const errors = [];

  for (const id of userIds) {
    try {
      const user = await assignUserToBranch(id, branchId, currentUser);
      updated.push(user.id);
    } catch (err) {
      errors.push({ userId: id, message: err.message });
    }
  }

  return { updated, errors };
};

const getUsersByBranch = async (branchId, currentUser) => {
  if (
    currentUser.role === "BRANCH_ADMIN" &&
    currentUser.branchId !== branchId
  ) {
    throw new Error("Access Denied");
  }

  return await prisma.user.findMany({
    where: { branchId },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      role: true,
      branchId: true,
      createdAt: true,
    },
  });
};

const getAllUser = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
      branchId: true,
      branch: {
        include: {
          users: true,
        },
      },
      facultySubjects: {
        include: {
          subject: true,
        },
      },
      shiftStartTime: true,
      shiftEndTime: true,
      lectures: {
        include: {
          attendance: true,
        },
      },
      staffAttendances: true,
      salary: true,
      facultyType: true,
      lectureRate: true,
      workingMinutesPerDay:true
    },
  });
};

const makeBrancheAdmin = async (currentUserId, userId, branchId) => {
  if (currentUserId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        previousRole: true,
      },
    });

    const previousRole = currentUser.previousRole || "STAFF";
    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        role: previousRole,
        previousRole: null,
      },
    });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const preRole = user.role;

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error("Cannot change super admin role");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      role: "BRANCH_ADMIN",
      branchId,
      previousRole: preRole,
    },
  });
};

const updateUser = async (
  id,
  name,
  phoneNumber,
  role,
  branchId,
  salary,
  shiftStartTime,
  shiftEndTime
) => {
  if (role === "STAFF") {
    const today = new Date().toISOString().split("T")[0];

    const shiftStart = new Date(`${today}T${shiftStartTime}`);
    const shiftEnd = new Date(`${today}T${shiftEndTime}`);
    return await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        role,
        branchId: Number(branchId),
        shiftStartTime: shiftStart,
        shiftEndTime: shiftEnd,
        salary: Number(salary),
      },
    });
  } else {
    return await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        role,
        branchId: Number(branchId),
        salary: Number(salary),
      },
    });
  }
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

const branchDashoard = async () => {
  const branch = await prisma.branch.findMany({
    include: {
      courses: {
        include: {
          batches: {
            include: {
              lectureSchedules: {
                include: {
                  subject: true
                }
              },
            },
          },
        },
      },
      users: {
        omit:{
          password:true
        }
      },
      staffAttendances: true,
    },
  });

  const faculty = await prisma.user.findMany({
    include: {
      facultySubjects: {
        include: { subject: true },
      },
      lectures: {
        include: { attendance: true, batch: true },
      },
      branch: true,
      staffAttendances: true,
    },
  });

  const lectures = await prisma.lectureSchedule.findMany({
    include: {
      faculty: true,
      subject: true,
      batch: true,
      attendance: true,
    },
  });

  return {
    branch,
    faculty,
    lectures,
  };
};

module.exports = {
  assignUserToBranch,
  bulkAssignUsersToBranch,
  getUsersByBranch,
  makeBrancheAdmin,
  getAllUser,
  branchDashoard,
  updateUser,
  deleteUser,
};
