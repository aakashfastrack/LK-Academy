const { prisma } = require("../../config/db");

const createlectureSchedule = async (
  {
    facultyId,
    subjectId,
    batchId,
    StartDate,
    EndDate,
    startTime,
    endTime,
    TotalScheduled,
  },
  currentUser,
) => {
  console.log("StartTime", startTime);
  console.log("EndTime", endTime);
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);

  console.log("Date set krna", new Date(startTime));
  console.log("start Date", startDateTime);

  if (endDateTime <= startDateTime) {
    throw new Error("End time must be after start time");
  }

  // 🔹 Overlap check (same faculty + same batch + same day)
  const overlap = await prisma.lectureSchedule.findFirst({
    where: {
      facultyId,
      batchId,
      StartDate: new Date(StartDate),
      OR: [
        {
          startTime: { lt: endDateTime },
          endTime: { gt: startDateTime },
        },
      ],
    },
  });

  if (overlap) {
    throw new Error("Lecture overlaps with an existing schedule");
  }

  // 🔹 Faculty–Subject mapping (batch independent)
  const existingMapping = await prisma.facultySubject.findUnique({
    where: {
      facultyId_subjectId: {
        facultyId,
        subjectId,
      },
    },
  });

  if (!existingMapping) {
    await prisma.facultySubject.create({
      data: { facultyId, subjectId },
    });
  }

  return await prisma.lectureSchedule.create({
    data: {
      facultyId,
      subjectId,
      batchId,
      StartDate: new Date(StartDate),
      EndDate: new Date(EndDate),
      startTime: startDateTime,
      endTime: endDateTime,
      TotalScheduled: TotalScheduled ? Number(TotalScheduled) : null,
    },
  });
};

const getLectureByIdAndType = async (id, type, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  if (type === "LECTURE_BASED") {
    return await prisma.lectureSchedule.findMany({
      where: {
        facultyId: Number(id),
      },
      include: {
        attendance: {
          where: {
            date: {
              gte: start,
              lte: end,
            },
          },
        },
        subject: true,
      },
    });
  } else {
    return await prisma.facultyAttendance.findMany({
      where: {
        facultyId: Number(id),
      },
      include: {
        faculty: true,
      },
    });
  }
};

const getLecture = async (id) => {
  return await prisma.lectureSchedule.findMany({
    where: {
      facultyId: Number(id),
    },
    include: {
      subject: true,
      batch: true,
    },
  });
};

const getLectureByBranchAndDate = async (batchId, date) => {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  return await prisma.lectureSchedule.findMany({
    where: {
      batchId,
      StartDate: {
        lte: dayStart,
      },
      EndDate: {
        gte: dayEnd,
      },
    },
    include: {
      faculty: { select: { id: true, name: true } },
      subject: true,
      batch: true,
      attendance: true,
    },
    orderBy: { startTime: "asc" },
  });
};

const getAllLecture = async () => {
  return await prisma.lectureSchedule.findMany({
    orderBy: { id: "desc" },
    include: {
      subject: true,
      faculty: true,
      // branch: true,
      batch: {
        include: {
          course: {
            include: {
              branch: true,
            },
          },
          lectureSchedules: true,
        },
      },
      attendance: true,
    },
  });
};

const deleteLecture = async (id) => {
  return await prisma.lectureSchedule.delete({
    where: { id },
  });
};

const updateLecture = async (
  id,
  facultyId,
  subjectId,
  batchId,
  StartDate,
  EndDate,
  startTime,
  endTime,
  TotalScheduled,
) => {
  return await prisma.lectureSchedule.update({
    where: { id },
    data: {
      facultyId,
      subjectId,
      batchId,
      StartDate: new Date(StartDate),
      EndDate: new Date(EndDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      TotalScheduled: TotalScheduled ? Number(TotalScheduled) : null,
    },
  });
};

module.exports = {
  createlectureSchedule,
  getLectureByBranchAndDate,
  getAllLecture,
  deleteLecture,
  updateLecture,
  getLectureByIdAndType,
  getLecture,
};
