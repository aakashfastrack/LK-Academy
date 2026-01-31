const { prisma } = require("../../config/db");

// const ALLOWED_MINUTES = 15;
// function calculatePenalty(plannedStart, plannedEnd, actualStart, actualEnd) {
//   const plannedStartTime = new Date(plannedStart);
//   const plannedEndTime = new Date(plannedEnd);
//   const actualStartTime = new Date(actualStart);
//   const actualEndTime = new Date(actualEnd);

//   const lateMinutes = Math.max(
//     0,
//     (actualStartTime - plannedStartTime) / (1000 * 60)
//   );

//   const earlyMinutes = Math.max(
//     0,
//     (plannedEndTime - actualEndTime) / (1000 * 60)
//   );

//   const is_late = lateMinutes > ALLOWED_MINUTES;
//   const isEarly = earlyMinutes > ALLOWED_MINUTES;

//   if (is_late && isEarly) return "BOTH";
//   if (is_late) return "LATE_START";
//   if (isEarly) return "EARLY_END";
//   return "NONE";
// }

const FIFTEEN_MIN = 15 * 60 * 1000;

const LECTURE_MINUTES = 120;
const ALLOWED_MINUTES = 15;

function calculatePenalty({
  plannedStart,
  plannedEnd,
  actualStart,
  actualEnd,
}) {
  // IMPORTANT: convert everything to timestamps (number)
  const pStart = new Date(plannedStart).getTime();
  const pEnd = new Date(plannedEnd).getTime();
  const aStart = new Date(actualStart).getTime();
  const aEnd = new Date(actualEnd).getTime();

  const isLate = aStart - pStart > FIFTEEN_MIN;
  const isEarly = pEnd - aEnd > FIFTEEN_MIN;

  let penalty = "NONE";
  if (isLate && isEarly) penalty = "BOTH";
  else if (isLate) penalty = "LATE_START";
  else if (isEarly) penalty = "EARLY_END";

  return penalty;
}

function calculateLectureBasedFacultyBackend({
  plannedStart,
  plannedEnd,
  actualStart,
  actualEnd,
  lectureRate,
  status, // CONDUCTED | CANCELLED | MISSED
}) {
  const plannedStartTime = new Date(plannedStart);
  const plannedEndTime = new Date(plannedEnd);
  const actualStartTime = new Date(actualStart);
  const actualEndTime = new Date(actualEnd);

  console.log(actualStartTime - plannedStartTime);

  // ---------- PENALTY LABEL ----------
  const lateMinutes = Math.max(
    0,
    (actualStartTime - plannedStartTime) / (1000 * 60),
  );

  const earlyMinutes = Math.max(
    0,
    (plannedEndTime - actualEndTime) / (1000 * 60),
  );

  let isLate = actualStart - plannedStart > FIFTEEN_MIN;
  let LateMin = (actualStart - plannedStart) / (60 * 1000);
  let isEarly = plannedEnd - actualEnd > FIFTEEN_MIN;
  let EarlyMin = (plannedEnd - actualEnd) / (60 * 1000);

  let penalty = "NONE";
  if (isLate && isEarly) penalty = "BOTH";
  else if (isLate) penalty = "LATE_START";
  else if (isEarly) penalty = "EARLY_END";

  // ---------- WORKED MINUTES ----------
  let workedMinutes = 0;
  if (actualEndTime > actualStartTime) {
    workedMinutes = Math.floor((actualEndTime - actualStartTime) / (1000 * 60));
  }

  let totalPenaltyMin = LateMin + EarlyMin;

  // ---------- PAYOUT ----------
  let lectureEquivalent = workedMinutes / LECTURE_MINUTES;
  let payout =
    lectureEquivalent > 1
      ? Number((lectureEquivalent * lectureRate).toFixed(2))
      : lectureRate;

  // ---------- STATUS OVERRIDES ----------
  if (status === "CANCELLED") {
    payout = Number((lectureRate / 2).toFixed(2));
  }

  if (status === "MISSED") {
    payout = 0;
  }

  return {
    penalty,
    workedMinutes,
    lectureEquivalent: Number(lectureEquivalent.toFixed(2)),
    payout,
    totalPenaltyMin,
  };
}

const markLectureAttendance = async ({
  lectureId,
  actualStartTime,
  actualEndTime,
  status,
  date,
}) => {
  const lecture = await prisma.lectureSchedule.findUnique({
    where: { id: lectureId },
    include: {
      faculty: true,
    },
  });

  const att = await prisma.lectureAttendance.findFirst({
    where: {
      lectureId: Number(lecture.id),
      date: date,
    },
  });

  if (att) {
    throw new Error("Already Marked");
  }

  if (!lecture) throw new Error("Lecture not found");

  let penalty = "NONE";
  let payout = 0;
  let penaltyMin = 0;

  if (status === "CANCELLED") {
    if (lecture.faculty.facultyType === "LECTURE_BASED") {
      payout = Math.floor((lecture.faculty.lectureRate || 0) / 2);
    }

    penalty = "NONE";
  } else if (status === "MISSED") {
    payout = 0;
    penalty = "NONE";
  } else {
    penalty = calculateLectureBasedFacultyBackend({
      plannedStart: lecture.startTime,
      plannedEnd: lecture.endTime,
      actualStart: actualStartTime,
      actualEnd: actualEndTime,
      lectureRate: Number(lecture.faculty.lectureRate),
      status,
    });

    if (lecture.faculty.facultyType === "LECTURE_BASED") {
      const durationMinutes =
        (new Date(actualEndTime) - new Date(actualStartTime)) / (1000 * 60);

      const lectureHour = durationMinutes / 60;
      const baseHours = 2;

      payout = penalty.payout;
      penaltyMin = penalty.totalPenaltyMin;
    }
  }

  const data = await prisma.lectureAttendance.create({
    data: {
      // lectureId:lectureId,
      lecture: {
        connect: {
          id: lectureId,
        },
      },
      actualStartTime,
      actualEndTime,
      penalty: penalty.penalty,
      payout: payout !== NaN ? payout : 0,
      status,
      date: date,
      penaltyMin: Number(penaltyMin),
    },
  });
  return data;
};

const getFacultyMonthlySummary = async (facultyId, month, year) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (!faculty || faculty.role !== "FACULTY") {
    throw new Error("Faculty not found");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const lectures = await prisma.lectureAttendance.findMany({
    where: {
      lecture: {
        facultyId,
      },
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  let conducted = 0;
  let cancelled = 0;
  let missed = 0;

  let lateCount = 0;
  let earlyCount = 0;
  let bothCount = 0;

  let totalPayout = 0;

  lectures.forEach((l) => {
    if (l.status === "CONDUCTED") conducted++;
    if (l.status === "CANCELLED") cancelled++;
    if (l.status === "MISSED") missed++;

    if (l.penalty === "LATE_START") lateCount++;
    if (l.penalty === "EARLY_END") earlyCount++;
    if (l.penalty === "BOTH") bothCount++;

    totalPayout += l.payout || 0;
  });

  const PlannedLectures = await prisma.lectureSchedule.count({
    where: {
      facultyId,
      StartDate: {
        lte: end,
      },
      EndDate: {
        gte: start,
      },
    },
  });

  const remainingLectures = PlannedLectures - (conducted + cancelled + missed);

  return {
    facultyId,
    month,
    year,
    facultyType: faculty.facultyType,

    PlannedLectures,
    conducted,
    cancelled,
    missed,
    remainingLectures,

    penalties: {
      late: lateCount,
      early: earlyCount,
      both: bothCount,
    },

    totalPayout: Math.floor(totalPayout),
  };
};

async function getLecturesForFacultyOnDate(facultyId, date) {
  return await prisma.lectureSchedule.findMany({
    where: {
      facultyId,
      StartDate: { lte: date },
      EndDate: { gte: date },
    },
  });
}

async function autoMarkLectureAttendanceForSalaryFaculty({
  facultyId,
  attendanceDate,
}) {
  const lectures = await getLecturesForFacultyOnDate(facultyId, attendanceDate);

  for (const lecture of lectures) {
    await prisma.lectureAttendance.upsert({
      where: {
        lectureId_date: {
          lectureId: lecture.id,
          date: attendanceDate,
        },
      },
      update: {
        status: "CONDUCTED",
        payout: 0,
        penalty: "NONE",
      },
      create: {
        lectureId: lecture.id,
        date: attendanceDate,
        actualStartTime: lecture.startTime,
        actualEndTime: lecture.endTime,
        status: "CONDUCTED",
        payout: 0,
        penalty: "NONE",
      },
    });
  }
}

// Salary Based Faculty Attendance and Salary Summary
const markSalaryBasedFacultyAttendance = async ({
  facultyId,
  date,
  inTime,
  outTime,
  isLeave,
}) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (
    !faculty ||
    faculty.role !== "FACULTY" ||
    faculty.facultyType !== "SALARY_BASED"
  ) {
    throw new Error("Salary based faculty not found");
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  let aOutTime = null;
  let aInTime = null;

  let workingMintues = 0;

  if (!isLeave) {
    if (!inTime || !outTime) {
      throw new Error("In-time and Out-time are required if not on leave");
    }

    aInTime = new Date(attendanceDate);
    const [inH, inM] = inTime.split(":").map(Number);
    aInTime.setHours(inH, inM, 0, 0);

    aOutTime = new Date(attendanceDate);
    const [outH, outM] = outTime.split(":").map(Number);
    aOutTime.setHours(outH, outM, 0, 0);

    if (aOutTime <= aInTime) {
      throw new Error("Out-time must be after In-time");
    }

    workingMintues = Math.floor((aOutTime - aInTime) / (1000 * 60));

    if (workingMintues < 0) {
      throw new Error("Out-time must be after In-time");
    }
  }

  const attendance = await prisma.facultyAttendance.upsert({
    where: {
      facultyId_date: {
        facultyId,
        date: attendanceDate,
      },
    },
    update: {
      inTime: aInTime,
      outTime: aOutTime,
      isLeave,
      // workingMintues,
      workingMinutes: workingMintues,
    },
    create: {
      faculty: {
        connect: {
          id: facultyId,
        },
      },
      date: attendanceDate,
      inTime: isLeave ? null : aInTime,
      outTime: isLeave ? null : aOutTime,
      isLeave,
      workingMinutes: workingMintues,
    },
  });

  if (!isLeave) {
    await autoMarkLectureAttendanceForSalaryFaculty({
      facultyId,
      attendanceDate,
    });
  }

  return attendance;
};

const getSalaryBasedFacultyMonthlySummary = async (facultyId, month, year) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (!faculty || faculty.role !== "FACULTY") {
    throw new Error("Invalid faculty");
  }

  if (faculty.facultyType !== "SALARY_BASED") {
    throw new Error("Faculty is not salary-based");
  }

  if (!faculty.salary) {
    throw new Error("faculty monthly salary not configured");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const attendance = await prisma.facultyAttendance.findMany({
    where: {
      facultyId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const totalDaysInMonth = end.getDate();
  const leaveDays = attendance.filter((a) => a.isLeave).length;

  const workingDays = totalDaysInMonth - leaveDays;
  const totalWorkingMinutes = attendance
    .filter((a) => !a.isLeave)
    .reduce((sum, a) => sum + a.workingMinutes, 0);

  const perDaySalary = faculty.salary / totalDaysInMonth;
  const leaveDeduction = leaveDays * perDaySalary;

  const netSalary = faculty.salary - leaveDeduction;

  return {
    facultyId,
    facultyType: "SALARY_BASED",
    month,
    year,
    monthlySalary: faculty.salary,
    perDaySalary: Math.round(perDaySalary),

    totalDays: totalDaysInMonth,
    workingDays,
    leaveDays,

    leaveDeduction: Math.round(leaveDeduction),
    netSalary: Math.max(0, Math.round(netSalary)),

    attendanceSummary: {
      totalWorkingMinutes,
      averageDailyMinutes:
        workingDays > 0 ? Math.round(totalWorkingMinutes / workingDays) : 0,
    },
  };
};

module.exports = {
  markLectureAttendance,
  getFacultyMonthlySummary,
  markSalaryBasedFacultyAttendance,
  getSalaryBasedFacultyMonthlySummary,
};
