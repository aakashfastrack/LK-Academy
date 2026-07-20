const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FIFTEEN_MIN = 15 * 60 * 1000;
const LECTURE_MINUTES = 120;

function mergeDateAndTime(date, time) {
  const d = new Date(date);
  const t = new Date(time);

  d.setHours(
    t.getHours(),
    t.getMinutes(),
    t.getSeconds(),
    t.getMilliseconds()
  );

  return d;
}

function calculate({
  plannedStart,
  plannedEnd,
  actualStart,
  actualEnd,
  lectureRate,
  status,
  lectureDate,
}) {
  const pStart = mergeDateAndTime(lectureDate, plannedStart);
  const pEnd = mergeDateAndTime(lectureDate, plannedEnd);

  const aStart = mergeDateAndTime(lectureDate, actualStart);
  const aEnd = mergeDateAndTime(lectureDate, actualEnd);

  const lateMinutes = Math.max(
    0,
    (aStart - pStart) / (1000 * 60)
  );

  const earlyMinutes = Math.max(
    0,
    (pEnd - aEnd) / (1000 * 60)
  );

  let penalty = "NONE";

  const isLate = lateMinutes > 15;
  const isEarly = earlyMinutes > 15;

  if (isLate && isEarly) penalty = "BOTH";
  else if (isLate) penalty = "LATE_START";
  else if (isEarly) penalty = "EARLY_END";

  const workedMinutes =
    (aEnd - aStart) / (1000 * 60);

  const lectureEquivalent =
    workedMinutes / LECTURE_MINUTES;

  let payout =
    lectureEquivalent <= 0.875
      ? Math.round(lectureEquivalent * lectureRate)
      : lectureRate;

  if (status === "CANCELLED")
    payout = Math.round(lectureRate / 2);

  if (status === "MISSED")
    payout = 0;

  return {
    penalty,
    payout,
    penaltyMin:
      lateMinutes + earlyMinutes >= 15
        ? Math.round(lateMinutes + earlyMinutes)
        : 0,
    actualStart: aStart,
    actualEnd: aEnd,
  };
}

async function main() {
  const attendances =
    await prisma.lectureAttendance.findMany({
      include: {
        lecture: {
          include: {
            faculty: true,
          },
        },
      },
    });

  console.log(
    `Found ${attendances.length} attendances`
  );

  for (const att of attendances) {
    if (
      !att.actualStartTime ||
      !att.actualEndTime
    )
      continue;

    const calc = calculate({
      plannedStart: att.lecture.startTime,
      plannedEnd: att.lecture.endTime,
      actualStart: att.actualStartTime,
      actualEnd: att.actualEndTime,
      lectureRate:
        att.lecture.faculty.lectureRate || 0,
      status: att.status,
      lectureDate: att.date,
    });

    await prisma.lectureAttendance.update({
      where: {
        id: att.id,
      },
      data: {
        actualStartTime: calc.actualStart,
        actualEndTime: calc.actualEnd,
        penalty: calc.penalty,
        penaltyMin: calc.penaltyMin,
        payout: calc.payout,
      },
    });

    console.log(
      `✔ Fixed Attendance ${att.id}`
    );
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });