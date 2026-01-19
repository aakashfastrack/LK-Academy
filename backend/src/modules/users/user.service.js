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
          subject: true,
          batch: {
            include: {
              course: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
      },
      staffAttendances: true,
      salary: true,
      facultyType: true,
      lectureRate: true,
      workingMinutesPerDay: true,
    },
  });
};

const makeBrancheAdmin = async (userId, branchId) => {
  // 1️⃣ Branch fetch karo
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  console.log(branch);
  if (!branch) {
    throw new Error("Branch not found");
  }

  // 2️⃣ Agar branch pe pehle se admin hai → usko revert karo
  if (branch.userId) {
    const oldAdmin = await prisma.user.findUnique({
      where: { id: branch.userId },
      select: {
        previousRole: true,
      },
    });

    const restoreRole = oldAdmin?.previousRole || "STAFF";

    await prisma.user.update({
      where: { id: branch.userId }, // ✅ FIXED
      data: {
        role: restoreRole,
        previousRole: null,
      },
    });
  }

  // 3️⃣ New user fetch
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error("Cannot change super admin role");
  }

  // 4️⃣ New admin bana do
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: "BRANCH_ADMIN",
      previousRole: user.role,
      branchId,
    },
  });

  // 5️⃣ Branch ko naye admin se link karo
  await prisma.branch.update({
    where: { id: branchId },
    data: {
      userId: userId,
    },
  });

  return updatedUser;
};

const updateUser = async (
  id,
  name,
  phoneNumber,
  role,
  branchId,
  salary,
  shiftStartTime,
  shiftEndTime,
  facultyType,
) => {
  if (role === "STAFF") {
    const today = new Date().toISOString().split("T")[0];

    const shiftStart = new Date(`${today}T${shiftStartTime}`);
    const shiftEnd = new Date(`${today}T${shiftEndTime}`);

    const workingMinutesPerDay = Math.floor(
      (shiftEnd - shiftStart) / (1000 * 60),
    );

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
        workingMinutesPerDay: workingMinutesPerDay,
      },
    });
  } else {
    if (facultyType === "SALARY_BASED") {
      const today = new Date().toISOString().split("T")[0];

      const shiftStart = new Date(`${today}T${shiftStartTime}`);
      const shiftEnd = new Date(`${today}T${shiftEndTime}`);

      const workingMinutesPerDay = Math.floor(
        (shiftEnd - shiftStart) / (1000 * 60),
      );

      return await prisma.user.update({
        where: { id },
        data: {
          name,
          phoneNumber,
          role,
          branchId: Number(branchId),
          salary: Number(salary),
          shiftEndTime: shiftEnd,
          shiftStartTime: shiftStart,
          workingMinutesPerDay: workingMinutesPerDay,
        },
      });
    }
    return await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        role,
        branchId: Number(branchId),
        lectureRate: Number(salary),
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
                  subject: true,
                },
              },
            },
          },
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          createdAt: true,
          branch: true,
          branchId: true,
          facultyType: true,
          lectureRate: true,
          salary: true,
          staffAttendances: true,
          previousRole: true,
          role: true,
          shiftEndTime: true,
          shiftStartTime: true,
          workingMinutesPerDay: true,
        },
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
      batch: {
        include: {
          course: true,
        },
      },
      attendance: true,
    },
  });

  const batch = await prisma.batch.findMany({
    include: {
      course: true,
      lectureSchedules: true,
      subjects: true,
    },
  });

  return {
    branch,
    faculty,
    lectures,
    batch,
  };
};

const userDashboard = async ({ branchId, userId }) => {
  const branch = await prisma.branch.findMany({
    where: {
      id: branchId,
    },
    include: {
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
      users: {
        omit: {
          password: true,
        },
      },
      staffAttendances: true,
    },
  });

  const faculty = await prisma.user.findMany({
    where: {
      id: userId,
    },
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
    where: {
      facultyId: userId,
    },
    include: {
      faculty: true,
      subject: true,
      batch: {
        include: {
          course: true,
        },
      },
      attendance: true,
    },
  });

  // const batch = await prisma.batch.findMany({
  //   where:{
  //     branchId
  //   },
  //   include: {
  //     course: true,
  //     lectureSchedules: true,
  //     subjects: true,
  //   },
  // });

  return {
    branch,
    faculty,
    lectures,
    // batch,
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
  userDashboard,
};
