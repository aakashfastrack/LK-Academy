const { prisma } = require("../../config/db");

const ALLOWED_MINUTES = 15;
function calculatePenalty(plannedStart, plannedEnd, actualStart, actualEnd) {
  const plannedStartTime = new Date(plannedStart);
  const plannedEndTime = new Date(plannedEnd);
  const actualStartTime = new Date(actualStart);
  const actualEndTime = new Date(actualEnd);

  const lateMinutes = Math.max(
    0,
    (actualStartTime - plannedStartTime) / (1000 * 60)
  );

  const earlyMinutes = Math.max(
    0,
    (plannedEndTime - actualEndTime) / (1000 * 60)
  );

  const is_late = lateMinutes > ALLOWED_MINUTES;
  const isEarly = earlyMinutes > ALLOWED_MINUTES;

  if (is_late && isEarly) return "BOTH";
  if (is_late) return "LATE_START";
  if (isEarly) return "EARLY_END";
  return "NONE";
}

const markLectureAttendance = async ({
  lectureId,
  actualStartTime,
  actualEndTime,
  status,
}) => {
  const lecture = await prisma.lectureSchedule.findUnique({
    where: { id: lectureId },
    include: {
      faculty: true,
    },
  });

  if (!lecture) throw new Error("Lecture not found");

  let penalty = "NONE";
  let payout = 0;

  if (status === "CANCELLED") {
    if (lecture.faculty.facultyType === "LECTURE_BASED") {
      payout = Math.floor((lecture.faculty.lectureRate || 0) / 2);
    }

    penalty = "NONE";
  } else if (status === "MISSED") {
    payout = 0;
    penalty = "NONE";
  } else {
    penalty = calculatePenalty(
      lecture.startTime,
      lecture.endTime,
      actualStartTime,
      actualEndTime
    );

    if(lecture.faculty.facultyType === "LECTURE_BASED"){
      const durationMinutes = (new Date(actualEndTime) - new Date(actualStartTime)) / (1000 * 60);

      const lectureHour = durationMinutes / 60;
      const baseHours = 2;

      payout = Math.floor(
        (lectureHour / baseHours) * (lecture.faculty.lectureRate || 0)
      )
    }
  }

  return await prisma.lectureAttendance.create({
    data: {
      lectureId,
      actualStartTime,
      actualEndTime,
      penalty,
      payout,
      status,
    },
  });
};

module.exports = {
  markLectureAttendance,
};
