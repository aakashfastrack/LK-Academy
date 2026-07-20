const { prisma } = require("../../config/db");

const generateReport = async ({ branchIds = [], month, year }) => {
  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // ---------- STAFF ----------
  const staffWhere =
    branchIds.length > 0
      ? {
          role: "STAFF",
          branchId: {
            in: branchIds,
          },
        }
      : {
          role: "STAFF",
        };

  const totalStaff = await prisma.user.count({
    where: staffWhere,
  });

  const staffs = await prisma.user.findMany({
    where: {
      role: "STAFF",

      ...(branchIds.length > 0 && {
        branchId: {
          in: branchIds,
        },
      }),
    },
  });

  const totalStaffSalary = staffs.reduce(
    (sum, item) => sum + (item.salary || 0),
    0,
  );

  // ---------- FACULTY ----------
  const facultyWhere =
    branchIds.length > 0
      ? {
          role: "FACULTY",
          facultyBranches: {
            some: {
              branchId: {
                in: branchIds,
              },
            },
          },
        }
      : {
          role: "FACULTY",
        };

  const totalFaculty = await prisma.user.count({
    where: facultyWhere,
  });

  // ---------- STAFF ATTENDANCE ----------
  const staffAttendance = await prisma.staffAttendance.findMany({
    where: {
      ...(branchIds.length > 0 && {
        branchId: {
          in: branchIds,
        },
      }),

      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // ---------- LECTURE ATTENDANCE ----------
  const lectureAttendance = await prisma.lectureAttendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },

      ...(branchIds.length > 0 && {
        lecture: {
          batch: {
            course: {
              branchId: {
                in: branchIds,
              },
            },
          },
        },
      }),
    },
  });

  console.table(
    lectureAttendance.slice(0, 20).map((x) => ({
      id: x.id,
      date: x.date,
      penaltyMin: x.penaltyMin,
      payout: x.payout,
    })),
  );

  const salaryBasedFaculties = await prisma.user.findMany({
    where: {
      role: "FACULTY",
      facultyType: "SALARY_BASED",

      ...(branchIds.length > 0 && {
        facultyBranches: {
          some: {
            branchId: {
              in: branchIds,
            },
          },
        },
      }),
    },
  });

  // ---------- TOTALS ----------
  const totalFacultyPenalty = lectureAttendance.reduce(
    (sum, item) => sum + item.penaltyMin,
    0,
  );

  const totalLecturePayout = lectureAttendance.reduce(
    (sum, item) => sum + item.payout,
    0,
  );

  const totalStaffPenalty = staffAttendance.reduce(
    (sum, item) => sum + item.totalPenalty,
    0,
  );

  const totalOvertimePay = staffAttendance.reduce(
    (sum, item) => sum + item.overtimePay,
    0,
  );

  const totalLectures = lectureAttendance.length;

  const totalPenalty = totalFacultyPenalty + totalStaffPenalty;

  const lectureBasedFacultySalary = totalLecturePayout;

  const salaryBasedFacultySalary = salaryBasedFaculties.reduce(
    (sum, item) => sum + (item.salary || 0),
    0,
  );

  const totalSalaryPaid =
    totalStaffSalary + salaryBasedFacultySalary + lectureBasedFacultySalary;

  const allBranches = await prisma.branch.findMany({
    where:
      branchIds.length > 0
        ? {
            id: {
              in: branchIds,
            },
          }
        : {},
  });

  const branchWiseBreakdown = await Promise.all(
    allBranches.map(async (branch) => {
      const totalFaculty = await prisma.user.count({
        where: {
          role: "FACULTY",
          facultyBranches: {
            some: {
              branchId: branch.id,
            },
          },
        },
      });

      const totalStaff = await prisma.user.count({
        where: {
          role: "STAFF",
          branchId: branch.id,
        },
      });

      const lectures = await prisma.lectureAttendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },

          lecture: {
            batch: {
              course: {
                branchId: branch.id,
              },
            },
          },
        },
      });

      const staffAttendance = await prisma.staffAttendance.findMany({
        where: {
          branchId: branch.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Staff salary
      const staffs = await prisma.user.findMany({
        where: {
          role: "STAFF",
          branchId: branch.id,
        },
      });

      const totalStaffSalary = staffs.reduce(
        (sum, item) => sum + (item.salary || 0),
        0,
      );

      // Salary based faculties
      const salaryBasedFaculties = await prisma.user.findMany({
        where: {
          role: "FACULTY",
          facultyType: "SALARY_BASED",
          facultyBranches: {
            some: {
              branchId: branch.id,
            },
          },
        },
      });

      const salaryBasedFacultySalary = salaryBasedFaculties.reduce(
        (sum, item) => sum + (item.salary || 0),
        0,
      );

      // Lecture based payout
      const lectureBasedFacultySalary = lectures.reduce(
        (sum, item) => sum + item.payout,
        0,
      );

      const totalSalaryPaid =
        totalStaffSalary + salaryBasedFacultySalary + lectureBasedFacultySalary;

      return {
        branchId: branch.id,
        branchName: branch.name,

        totalFaculty,

        totalStaff,

        totalLectures: lectures.length,

        totalLecturePayout: lectures.reduce(
          (sum, item) => sum + item.payout,
          0,
        ),

        totalFacultyPenalty: lectures.reduce(
          (sum, item) => sum + item.penaltyMin,
          0,
        ),

        totalStaffPenalty: staffAttendance.reduce(
          (sum, item) => sum + item.totalPenalty,
          0,
        ),

        totalOvertimePay: staffAttendance.reduce(
          (sum, item) => sum + item.overtimePay,
          0,
        ),

        totalSalaryPaid,
      };
    }),
  );

  return {
    month,
    year,

    summary: {
      totalFaculty,
      totalStaff,

      totalLectures,

      totalLecturePayout,

      totalFacultyPenalty,

      totalStaffPenalty,

      totalPenalty,

      totalOvertimePay,

      lectureBasedFacultySalary,

      salaryBasedFacultySalary,

      totalStaffSalary,

      totalSalaryPaid,
    },

    branchWiseBreakdown,
  };
};

module.exports = {
  generateReport,
};
