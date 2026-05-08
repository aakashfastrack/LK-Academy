import { mainRoute } from "@/components/apiroute";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AllAttendance = ({ open, setOpen, userdata, mon, yea }) => {
  const [serverData, setServerData] = useState([]);
  const [typ, setTyp] = useState();
  const [myLecturesData, setMyLecturesData] = useState([]);
  const [lecData, setLecData] = useState([]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  function formatTime(isoIst) {
    if (!isoIst) return "";

    const safeIso = isoIst;

    const date = new Date(safeIso);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const getStatus = (lecture) => {
    const attendance = lecture.attendance?.[0];
    const now = new Date();

    if (attendance?.actualStartTime && attendance?.actualEndTime)
      return "Conducted";

    if (!attendance && new Date(lecture.endTime) < now) return "Missed";

    return "Planned";
  };

  function mergeDateAndTime(date, time) {
    const d = new Date(date);
    const t = new Date(time);

    d.setHours(t.getHours());
    d.setMinutes(t.getMinutes());
    d.setSeconds(t.getSeconds());
    d.setMilliseconds(0);

    return d;
  }

  function calculatePenaltyMinutes(
    actualStart,
    actualEnd,
    plannedStart,
    plannedEnd,
    date,
  ) {
    if (!actualStart || !actualEnd || !plannedStart || !plannedEnd) {
      return 0;
    }

    const actualStartTime = mergeDateAndTime(date, actualStart);
    const actualEndTime = mergeDateAndTime(date, actualEnd);

    // const plannedStartTime = new Date(plannedStart);
    // const plannedEndTime = new Date(plannedEnd);
    const plannedStartTime = mergeDateAndTime(date, plannedStart);
    const plannedEndTime = mergeDateAndTime(date, plannedEnd);


    // Late start
    let lateMinutes = (actualStartTime - plannedStartTime) / (1000 * 60);

    let earlyMinutes = (plannedEndTime - actualEndTime) / (1000 * 60);

    // Handle AM/PM or timezone bug
    if (lateMinutes > 720) {
      lateMinutes -= 720; // remove 12 hr
    }

    if (earlyMinutes > 720) {
      earlyMinutes -= 720;
    }

    lateMinutes = Math.max(0, lateMinutes);
    earlyMinutes = Math.max(0, earlyMinutes);

    console.log("LateMin", lateMinutes);
    console.log("earlyMinutes", earlyMinutes);

    const totalPenaltyMin = lateMinutes + earlyMinutes;

    // Apply penalty only if >= 15 min
    return totalPenaltyMin >= 15 ? Math.floor(totalPenaltyMin) : 0;
  }

  const mapLecturesToUI = (lectures) => {
    return (
      lectures
        .filter(
          (lec) => Array.isArray(lec.attendance) && lec.attendance.length > 0,
        )

        // 🔥 flatten lectures → attendance rows
        .flatMap((lec) =>
          lec.attendance.map((att) => {
            const now = new Date();

            let status = att?.status;
            // if (att.actualStartTime && att.actualEndTime) {
            //   status = "Conducted";
            // } else if (new Date(lec.endTime) < now) {
            //   status = "Missed";
            // }
            if (status === "CONDUCTED") status = "Conducted";
            else if (status === "MISSED") status = "Missed";
            else status = "Cancelled";

            let penaltyMin = calculatePenaltyMinutes(
              att.actualStartTime,
              att.actualEndTime,
              lec.startTime,
              lec.endTime,
              att.date,
            );

            return {
              date: formatDate(att.date || lec.StartDate),
              subject: lec.subject?.name || "-",
              plannedTime: `${formatTime(lec.startTime)} – ${formatTime(
                lec.endTime,
              )}`,
              actualTime:
                att.actualStartTime && att.actualEndTime
                  ? `${formatTime(att.actualStartTime)} – ${formatTime(
                      att.actualEndTime,
                    )}`
                  : "-",
              status,
              penalty: att.penalty || "NONE",
              sortTime: att.date,
              penaltyMin,
            };
          }),
        )

        // 🔥 latest first
        .sort((a, b) => new Date(a.sortTime) - new Date(b.sortTime))
    );
  };

  const myLectureHeaders = [
    "Date",
    "Subject",
    "Planned Time",
    "Actual Time",
    "Status",
    "Penalty",
  ];

  const myLecturHeaders = [
    "Date",
    "Planned Time",
    "Total time worked",
    "Status",
  ];

  const lecHeader = [
    "Date",
    "Planned Time",
    "InTime",
    "OutTime",
    "late penalty",
    "overtime",
    "Status",
  ];

  useEffect(() => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const id = userdata.id;
    const type = userdata.facultyType;
    setTyp(type);
    const role = userdata.role;
    const loadData = async () => {
      try {
        if (role === "FACULTY") {
          const { data } = await axios.get(
            `${mainRoute}/api/lecture/lectureatt?id=${id}&type=${type}&month=${
              mon + 1
            }&year=${yea}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tok.data.token}`,
              },
            },
          );
          console.log(data);
          setServerData(data.data);
        } else if (role === "STAFF") {
          const { data } = await axios.get(
            `${mainRoute}/api/staffAttendance/report?staffId=${id}&month=${
              mon + 1
            }&year=${yea}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tok.data.token}`,
              },
            },
          );

          console.log(data.data);
          setServerData(data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  }, [userdata, mon, yea]);

  useEffect(() => {
    if (typ === "LECTURE_BASED") {
      const uiData = mapLecturesToUI(serverData);
      setMyLecturesData(uiData);
    } else {
      console.log(serverData);
      setLecData(serverData);
    }
  }, [serverData]);

  function convertMinToHours(time) {
    if (!time || time <= 0) return "0 mins";

    const hrs = Math.floor(time / 60);
    const mins = time % 60;

    if (hrs > 0 && mins > 0) {
      return `${hrs} hr ${mins} mins`;
    }

    if (hrs > 0) {
      return `${hrs} hr`;
    }

    return `${mins} mins`;
  }

  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center">
          <div className="h-[80vh] p-5 w-[90%] xl:w-[80vw] bg-white shadow-2xl rounded-2xl  ">
            <div className="flex justify-end px-5">
              <span
                className="cursor-pointer font-bold"
                onClick={() => {
                  setOpen(false);
                  // setUser({});
                  setLecData([]);
                  setMyLecturesData([]);
                  setServerData([]);
                }}
              >
                x
              </span>
            </div>

            <div className="w-[98%]  h-full items-center overflow-auto xl:overflow-x-hidden">
              <ul
                className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                  typ === "LECTURE_BASED"
                    ? `xl:grid-cols-6`
                    : typ === "SALARY_BASED"
                      ? `xl:grid-cols-4`
                      : `xl:grid-cols-7`
                } text-center border-b p-2 font-semibold`}
              >
                {typ === "LECTURE_BASED"
                  ? myLectureHeaders.map((item, i) => <li key={i}>{item}</li>)
                  : typ === "SALARY_BASED"
                    ? myLecturHeaders.map((item, i) => <li key={i}>{item}</li>)
                    : lecHeader.map((item, i) => <li key={i}>{item}</li>)}
              </ul>

              {myLecturesData.length > 0 &&
                myLecturesData.map((item, i) => (
                  <ul
                    key={i}
                    className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                      typ === "LECTURE_BASED"
                        ? `xl:grid-cols-6`
                        : typ === "SALARY_BASED"
                          ? `xl:grid-cols-4`
                          : `xl:grid-cols-7`
                    } text-center border-b p-2`}
                  >
                    <li>{item.date}</li>
                    {typ === "LECTURE_BASED" && <li>{item.subject}</li>}
                    <li>{item.plannedTime}</li>
                    <li>
                      {item.status != "Conducted" ? "-" : item.actualTime}
                    </li>
                    <li
                      className={
                        item.status === "Conducted"
                          ? "text-green-600"
                          : item.status === "Missed"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }
                    >
                      {item.status}
                    </li>
                    <li>{convertMinToHours(item.penaltyMin)}</li>
                  </ul>
                ))}

              {lecData.length > 0 &&
                lecData.map((item, i) => {
                  return (
                    <ul
                      key={i}
                      className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                        typ === "LECTURE_BASED"
                          ? `xl:grid-cols-6`
                          : typ === "SALARY_BASED"
                            ? `xl:grid-cols-4`
                            : `xl:grid-cols-7`
                      } text-center border-b p-2`}
                    >
                      <li>{formatDate(item.date)}</li>
                      <li>{`${formatTime(
                        item.faculty?.shiftStartTime || item?.shiftStartTime,
                      )}-${formatTime(item.faculty?.shiftEndTime || item?.shiftEndTime)}`}</li>
                      <li>
                        {userdata.role === "STAFF"
                          ? item?.status === "PRESENT"
                            ? formatTime(item?.inTime || item?.actualInTime)
                            : "-"
                          : !item?.isLeave
                            ? convertMinToHours(item?.workingMinutes)
                            : "-"}
                      </li>

                      {userdata.role === "STAFF" && (
                        <li>
                          {item?.status === "PRESENT"
                            ? formatTime(item?.outTime || item?.actualOutTime)
                            : "-"}
                        </li>
                      )}
                      {userdata.role === "STAFF" && (
                        <>
                          <li
                            className={`${item?.totalPenalty > 0 ? "text-red-600" : "text-black"}`}
                          >
                            ₹{item?.totalPenalty || 0}
                          </li>
                          <li
                            className={`${item?.overtimePay > 0 ? "text-green-600" : "text-black"}`}
                          >
                            ₹{item?.overtimePay || 0}
                          </li>
                        </>
                      )}
                      {userdata.role === "STAFF" ? (
                        <li
                          className={
                            item.status === "ONLEAVE"
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {item.status === "ONLEAVE" ? "On Leave" : "Present"}
                        </li>
                      ) : (
                        <li
                          className={
                            !item.isLeave ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.isLeave ? "On Leave" : "Present"}
                        </li>
                      )}
                    </ul>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllAttendance;
