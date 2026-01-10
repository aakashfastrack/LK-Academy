const { prisma } = require("../../config/db");

function getPerMinuteRate(
  monthlySalary,
  workingMinutesPerDay,
  workingDays = 30
) {
  return monthlySalary / (workingDays * workingMinutesPerDay);
}

function calculateStaffAttendance({
  shiftStartTime,
  shiftEndTime,
  actualInTime,
  actualOutTime,
  monthlySalary,
  workingMinutesPerDay,
}) {
  const perMinuteRate = getPerMinuteRate(
    monthlySalary,
    workingMinutesPerDay
  );

  // ⏰ Late calculation
  let lateMinutes = Math.max(
    0,
    Math.floor((actualInTime - shiftStartTime) / (1000 * 60))
  );

  let isLate = false;
  let fixedPenalty = 0;
  let extraPenalty = 0;

  if (lateMinutes > 15) {
    isLate = true;
    fixedPenalty = 50;

    // shift extension check
    const expectedExtendedEnd =
      new Date(shiftEndTime.getTime() + lateMinutes * 60000);

    if (!actualOutTime || actualOutTime < expectedExtendedEnd) {
      const unextendedMinutes = Math.max(
        0,
        Math.floor(
          (expectedExtendedEnd - (actualOutTime || shiftEndTime)) /
            (1000 * 60)
        )
      );
      extraPenalty = Math.floor(unextendedMinutes * perMinuteRate);
    }
  }

  // ⏱️ Overtime (starts AFTER 30 min)
  let overtimeMinutes = 0;
  let overtimePay = 0;

  if (actualOutTime) {
    const overtimeRaw =
      Math.floor((actualOutTime - shiftEndTime) / (1000 * 60)) - 30;

    if (overtimeRaw > 0) {
      overtimeMinutes = overtimeRaw;
      overtimePay = Math.floor(overtimeMinutes * perMinuteRate);
    }
  }

  return {
    lateMinutes,
    isLate,
    fixedPenalty,
    extraPenalty,
    overtimeMinutes,
    overtimePay,
  };
}

const markStaffAttendance = async ({
  staffId,
  branchId,
  shiftStartTime,
  shiftEndTime,
  actualInTime,
  actualOutTime,
}) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!staff || !staff.monthlySalary || !staff.workingMinutesPerDay) {
    throw new Error("Staff salary or working time not configured");
  }

  const calc = calculateStaffAttendance({
    shiftStartTime,
    shiftEndTime,
    actualInTime,
    actualOutTime,
    monthlySalary: staff.monthlySalary,
    workingMinutesPerDay: staff.workingMinutesPerDay,
  });

  return await prisma.staffAttendance.create({
    data: {
      staffId,
      branchId,
      date: new Date(shiftStartTime.setHours(0, 0, 0, 0)),
      shiftStartTime,
      shiftEndTime,
      actualInTime,
      actualOutTime,

      isLate: calc.isLate,
      lateMinutes: calc.lateMinutes,
      extraPenalty: calc.extraPenalty,

      overtimeMinutes: calc.overtimeMinutes,
      overtimePay: calc.overtimePay,
    },
  });
};

const getStaffMonthlyReport = async (staffId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return await prisma.staffAttendance.findMany({
    where: {
      staffId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });
};

module.exports = {
  markStaffAttendance,
  getStaffMonthlyReport,
};
