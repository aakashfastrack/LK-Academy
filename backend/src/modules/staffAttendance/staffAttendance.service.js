const { prisma } = require("../../config/db");

function getPerMinuteRate(monthlySalary, workingMinutesPerDay, workingDays) {
  return monthlySalary / (workingDays * workingMinutesPerDay);
}

const getDaysInCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

function calculateStaffAttendance({
  shiftStartTime,
  actualInTime,
  actualOutTime,
  monthlySalary,
  workingMinutesPerDay,
}) {
  const GRACE_MINUTES = 15;
  const FIXED_PENALTY = 50;

  const workingDays = getDaysInCurrentMonth();
  const perMinuteRate = monthlySalary / (workingDays * workingMinutesPerDay);

  // -------- ACTUAL WORK --------
  const actualWorkedMinutes = Math.max(
    0,
    Math.floor((actualOutTime - actualInTime) / (1000 * 60)),
  );

  // -------- REQUIRED --------
  const requiredMinutes = workingMinutesPerDay;

  // -------- LATE --------
  const lateMinutes = Math.max(
    0,
    Math.floor((actualInTime - shiftStartTime) / (1000 * 60)),
  );

  // -------- SHORTFALL --------
  const shortfallMinutes = Math.max(0, requiredMinutes - actualWorkedMinutes);

  const isLate = lateMinutes > GRACE_MINUTES;
  const fixedPenalty = isLate || shortfallMinutes ? FIXED_PENALTY : 0;

  let extraPenalty = 0;

  if (shortfallMinutes > GRACE_MINUTES) {
    const penaltyMinutes = shortfallMinutes;
    extraPenalty = Number((penaltyMinutes * perMinuteRate).toFixed(2));
  }

  // -------- OVERTIME --------
  const extraMinutes = Math.max(0, actualWorkedMinutes - requiredMinutes);

  const overtimeMinutes = Math.floor(extraMinutes);
  const overtimePay =
    overtimeMinutes >= 30 ? Math.floor(overtimeMinutes * perMinuteRate) : 0;

  return {
    lateMinutes,
    isLate,

    actualWorkedMinutes,
    shortfallMinutes,

    fixedPenalty,
    extraPenalty,
    totalPenalty: Number((fixedPenalty + extraPenalty).toFixed(2)),

    overtimeMinutes,
    overtimePay,

    perMinuteRate: Number(perMinuteRate.toFixed(2)),
  };
}

const markStaffAttendance = async ({
  staffId,
  branchId,
  shiftStartTime,
  shiftEndTime,
  actualInTime,
  actualOutTime,
  date,
  status,
}) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!staff || !staff.salary || !staff.workingMinutesPerDay) {
    throw new Error("Staff salary or working time not configured");
  }

  const calc = calculateStaffAttendance({
    shiftStartTime,
    shiftEndTime,
    actualInTime,
    actualOutTime,
    monthlySalary: staff.salary,
    workingMinutesPerDay: staff.workingMinutesPerDay,
  });

  // let date1 = new Date();
  // let date = new Date(date1.setHours(0, 0, 0, 0));

  let date1 = new Date(date);

  date1.setUTCHours(0, 0, 0, 0);

  return await prisma.staffAttendance.create({
    data: {
      staffId,
      branchId,
      date: date,
      shiftStartTime,
      shiftEndTime,
      actualInTime,
      actualOutTime,
      status,

      isLate: calc.isLate,
      lateMinutes: Math.floor(calc.lateMinutes),
      extraPenalty: Math.floor(calc.extraPenalty),
      totalPenalty: Math.floor(calc.totalPenalty),

      overtimeMinutes: Math.floor(calc.overtimeMinutes),
      overtimePay: Math.floor(calc.overtimePay),
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

const getStaffMonthlySalarySummary = async (staffId, month, year) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const perDaySalary = staff.salary / daysInMonth;

  if (!staff || !staff.salary) {
    throw new Error("Staff salary not configured");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const attendance = await prisma.staffAttendance.findMany({
    where: {
      staffId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  console.log(attendance);

  let fixedLatePenalties = 0;
  let totalExtaPenalties = 0;
  let totalOvertimePay = 0;
  let lateDaysCount = 0;
  let totalPenalties = 0;
  let leaveDays = 0;
  const PAID_LEAVE_LIMIT = 4;

  attendance.forEach((a) => {
    if (a.status === "ONLEAVE") {
      leaveDays += 1;
      return;
    }
    if (a.isLate) {
      lateDaysCount += 1;
      fixedLatePenalties += 50;
    }

    totalExtaPenalties += a.extraPenalty || 0;
    totalPenalties += a.totalPenalty || 0;
    totalOvertimePay += a.overtimePay || 0;
  });

  const unpaidLeaveDays = Math.max(0, leaveDays - PAID_LEAVE_LIMIT);
  const leaveDeduction = unpaidLeaveDays * perDaySalary;

  const netPay =
    staff.salary -
    fixedLatePenalties -
    totalExtaPenalties -
    leaveDeduction +
    totalOvertimePay;

  return {
    staffId,
    month,
    year,

    monthlySalary: staff.salary,

    breakdown: {
      daysInMonth,
      perDaySalary: Math.floor(perDaySalary),
      leaveDays,
      paidLeavesUsed: Math.min(leaveDays, PAID_LEAVE_LIMIT),
      unpaidLeaveDays,
      leaveDeduction: Math.floor(leaveDeduction),

      lateDays: lateDaysCount,
      fixedLatePenalties,
      totalExtaPenalties,
      totalOvertimePay,
    },
    netPay: Math.max(0, Math.floor(netPay)),
  };
};

module.exports = {
  markStaffAttendance,
  getStaffMonthlyReport,
  getStaffMonthlySalarySummary,
};
