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

    // 🔥 remove Z so JS treats it as local time
    const safeIso = isoIst;

    const date = new Date(safeIso.replace("Z", ""));

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

            let status = "Planned";
            if (att.actualStartTime && att.actualEndTime) {
              status = "Conducted";
            } else if (new Date(lec.endTime) < now) {
              status = "Missed";
            }

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
              sortTime: att.actualStartTime || att.date, // for sorting
            };
          }),
        )

        // 🔥 latest first
        .sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime))

        // 🔥 last 5 records
        .slice(0, 5)
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

  const lecHeader = ["Date", "Planned Time", "InTime", "OutTime", "Status"];

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
      console.log(uiData);
      setMyLecturesData(uiData);
    } else {
      setLecData(serverData);
    }
  }, [serverData]);

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
                }}
              >
                x
              </span>
            </div>

            <div className="w-[98%]  h-full items-center overflow-auto xl:overflow-x-hidden">
              <ul
                className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                  typ === "LECTURE_BASED" ? `xl:grid-cols-6` : `xl:grid-cols-5`
                } text-center border-b p-2 font-semibold`}
              >
                {typ === "LECTURE_BASED"
                  ? myLectureHeaders.map((item, i) => <li key={i}>{item}</li>)
                  : lecHeader.map((item, i) => <li key={i}>{item}</li>)}
              </ul>

              {myLecturesData.length > 0 &&
                myLecturesData.map((item, i) => (
                  <ul
                    key={i}
                    className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                      typ === "LECTURE_BASED"
                        ? `xl:grid-cols-6`
                        : `xl:grid-cols-5`
                    } text-center border-b p-2`}
                  >
                    <li>{item.date}</li>
                    {typ === "LECTURE_BASED" && <li>{item.subject}</li>}
                    <li>{item.plannedTime}</li>
                    <li>{item.actualTime}</li>
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
                    <li>{item.penalty}</li>
                  </ul>
                ))}

              {lecData.length > 0 &&
                lecData.map((item, i) => {
                  // console.log(item)
                  return (
                    <ul
                      key={i}
                      className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                        typ === "LECTURE_BASED"
                          ? `xl:grid-cols-6`
                          : `xl:grid-cols-5`
                      } text-center border-b p-2`}
                    >
                      <li>{formatDate(item.date)}</li>
                      <li>{`${formatTime(
                        item.faculty?.shiftStartTime || item?.shiftStartTime,
                      )}-${formatTime(item.faculty?.shiftEndTime || item?.shiftEndTime)}`}</li>
                      <li>
                        {item?.status === "PRESENT"
                          ? formatTime(item?.inTime || item?.actualInTime)
                          : "-"}
                      </li>
                      <li>
                        {item?.status === "PRESENT"
                          ? formatTime(item?.outTime || item?.actualOutTime)
                          : "-"}
                      </li>
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
                      <li>{item.penalty}</li>
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
