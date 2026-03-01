"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useManagement } from "@/context/ManagementContext";
import axios from "axios";
import { mainRoute } from "../apiroute";

const FacAttendance = () => {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (iso) => {
    if (!iso) return;
    const date = new Date(iso)
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatus = (lecture) => {
    const attendance = lecture.attendance?.[0];
    const now = new Date();

    if (attendance?.actualStartTime && attendance?.actualEndTime)
      return "Conducted";

    if (!attendance && new Date(lecture.endTime) < now) return "Missed";

    return "Planned";
  };

  // const mapLecturesToUI = (lectures) => {
  //   return (
  //     lectures
  //       // 👉 sirf wahi jisme attendance mark hui ho (agar chaho)
  //       .filter((lec) => lec.attendance && lec.attendance.length > 0)

  //       // 👉 latest first
  //       .sort(
  //         (a, b) =>
  //           new Date(b.attendance[0].actualStartTime) -
  //           new Date(a.attendance[0].actualStartTime)
  //       )

  //       // 👉 last 5
  //       .slice(0, 5)

  //       .map((lec) => {
  //         const attendance = lec.attendance[0];

  //         return {
  //           date: formatDate(lec.StartDate),
  //           subject: lec.subject?.name || "-",
  //           plannedTime: `${formatTime(lec.startTime)} – ${formatTime(
  //             lec.endTime
  //           )}`,
  //           actualTime: attendance
  //             ? `${formatTime(attendance.actualStartTime)} – ${formatTime(
  //                 attendance.actualEndTime
  //               )}`
  //             : "-",
  //           status: getStatus(lec),
  //           penalty: attendance?.penalty || "NONE",
  //         };
  //       })
  //   );
  // };

  const mapLecturesToUI = (lectures) => {
    console.log(lectures);
    return (
      lectures
        .filter(
          (lec) => Array.isArray(lec.attendance) && lec.attendance.length > 0
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
                lec.endTime
              )}`,
              actualTime:
                att.actualStartTime && att.actualEndTime
                  ? `${formatTime(att.actualStartTime)} – ${formatTime(
                      att.actualEndTime
                    )}`
                  : "-",
              status,
              penalty: att.penalty || "NONE",
              sortTime: att.actualStartTime || att.date, // for sorting
            };
          })
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

  // const myLecturesData = [
  //   {
  //     date: "06-Jan-2025",
  //     subject: "Mathematics",
  //     plannedTime: "10:00 – 11:00",
  //     actualTime: "10:05 – 11:00",
  //     status: "Conducted",
  //     penalty: "None",
  //   },
  //   {
  //     date: "05-Jan-2025",
  //     subject: "Physics",
  //     plannedTime: "11:00 – 12:00",
  //     actualTime: "11:25 – 12:00",
  //     status: "Conducted",
  //     penalty: "Late Start",
  //   },
  //   {
  //     date: "04-Jan-2025",
  //     subject: "Chemistry",
  //     plannedTime: "09:30 – 10:30",
  //     actualTime: "-",
  //     status: "Missed",
  //     penalty: "Both",
  //   },
  //   {
  //     date: "07-Jan-2025",
  //     subject: "Computer Science",
  //     plannedTime: "02:00 – 03:00",
  //     actualTime: "-",
  //     status: "Upcoming",
  //     penalty: "-",
  //   },
  // ];

  const { fetchLecture } = useManagement();
  const [serverdata, setServerdata] = useState([]);
  const [myLecturesData, setMyLecturesData] = useState([]);
  const [typ, setType] = useState("LECTURE_BASED");
  const [lecData, setLecData] = useState([]);
  const [currentmon, setCurrentMon] = useState(new Date().getMonth());
  const [currentyea, setCurrentYea] = useState(new Date().getFullYear());

  useEffect(() => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const id = tok.data.user.id;
    const type = tok.data.user.type;
    setType(type);
    console.log(tok.data.user);
    const loadData = async () => {
      const { data } = await axios.get(
        `${mainRoute}/api/lecture/lectureatt?id=${id}&type=${type}&month=${currentmon+1}&year=${currentyea}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tok.data.token}`,
          },
        }
      );

      console.log(data.data);

      setServerdata(data.data);
    };
    loadData();
  }, [currentmon, currentyea]);

  useEffect(() => {
    if (typ === "LECTURE_BASED") {
      const uiData = mapLecturesToUI(serverdata);
      console.log(uiData);
      setMyLecturesData(uiData);
    } else {
      setLecData(serverdata);
    }
  }, [serverdata]);

  const list = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let cYear = new Date().getFullYear();

  const years = Array.from(
    {
      length: cYear - 2024 + 1,
    },
    (_, i) => 2024 + i
  );

  return (
    <>
      <div className="h-full bg-white m-2 rounded flex flex-col overflow-hidden items-center">
        {/* filter */}

        <div className="w-full flex justify-end p-2  gap-2">
          <div className="flex gap-4 border-b-2 pb-2">
            {/* <p className="text-xl font-semibold"></p> */}
            <Select value={currentmon} onValueChange={(v) => setCurrentMon(v)}>
              <SelectTrigger className={`w-45`}>
                <SelectValue placeholder={"Role"} />
              </SelectTrigger>
              <SelectContent>
                {list.map((item, i) => (
                  <SelectItem key={i} value={i}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentyea} onValueChange={(v) => setCurrentYea(v)}>
              <SelectTrigger className={`w-45`}>
                <SelectValue placeholder={"Year"} />
              </SelectTrigger>
              <SelectContent>
                {years.map((item, i) => (
                  <SelectItem key={i} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* data */}
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

          {/* {myLecturesData.map((item, i) => (
            <ul key={i} className="grid grid-cols-6 text-center border-b p-2">
              <li>{item.date}</li>
              <li>{item.subject}</li>
              <li>{item.plannedTime}</li>
              <li>{item.actualTime}</li>
              <li>{item.status}</li>
              <li>{item.penalty}</li>
            </ul>
          ))} */}

          {myLecturesData.length > 0 &&
            myLecturesData.map((item, i) => (
              <ul
                key={i}
                className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                  typ === "LECTURE_BASED" ? `xl:grid-cols-6` : `xl:grid-cols-5`
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
            lecData.map((item, i) => (
              <ul
                key={i}
                className={`grid grid-cols-[100px_180px_260px_220px_140px_140px] ${
                  typ === "LECTURE_BASED" ? `xl:grid-cols-6` : `xl:grid-cols-5`
                } text-center border-b p-2`}
              >
                <li>{formatDate(item.date)}</li>
                <li>{`${formatTime(item.faculty.shiftStartTime)}-${formatTime(
                  item.faculty.shiftEndTime
                )}`}</li>
                <li>{formatTime(item.inTime || "") || "-"}</li>
                <li>{formatTime(item.outTime || "") || "-"}</li>
                <li
                  className={!item.isLeave ? "text-green-600" : "text-red-600"}
                >
                  {item.isLeave ? "On Leave" : "Present"}
                </li>
                <li>{item.penalty}</li>
              </ul>
            ))}
        </div>
      </div>
    </>
  );
};

export default FacAttendance;
