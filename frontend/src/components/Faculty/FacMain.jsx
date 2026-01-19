"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { mainRoute } from "../apiroute";

const FacMain = () => {
  const lecturehistory = [
    "Date",
    "Subject",
    "Planned Time",
    "Actual Time",
    "Status",
    "Penalty",
  ];

  // const lectureHistory = [
  //   {
  //     date: "06-Jan-2025",
  //     subject: "Mathematics",
  //     planned: "10:00 – 11:00",
  //     actual: "10:05 – 11:00",
  //     status: "Conducted",
  //     penalty: "None",
  //   },
  //   {
  //     date: "05-Jan-2025",
  //     subject: "Physics",
  //     planned: "11:00 – 12:00",
  //     actual: "11:25 – 12:00",
  //     status: "Conducted",
  //     penalty: "Late Start",
  //   },
  // ];

  const [faculty, setFaculty] = useState({});
  const [staff, setStaff] = useState([]);
  const [branch, setBranch] = useState({});
  const [lecture, setLecture] = useState([]);
  const [attendances, setAttendance] = useState([]);
  const [penalty, setPenalty] = useState({});

  useEffect(() => {
    let tokn = JSON.parse(localStorage.getItem("user"));
    let token = tokn.data.token;
    let userId = tokn.data.user.id;
    let branchId = tokn.data.user.branch.id;
    setBranch(tokn.data.user.branch);

    const loadData = async () => {
      const { data } = await axios.get(
        `${mainRoute}/api/users/role/dash?userId=${userId}&branchId=${branchId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const facultyData = data.data.faculty;
      console.log(facultyData);
      console.log(data.data.lectures);

      // const staffData = data.data.faculty.filter(
      //   (user) => user.role === "STAFF"
      // ).filter((user)=>user.branchId === tokn.data.user.branch.id);
      //   const branchData = data.data.branch;

      const lectur = data.data.lectures;

      // console.log(branchData);
      setFaculty(facultyData[0]);
      setLecture(lectur);
    };

    loadData();
  }, []);

  useEffect(() => {
    const last5AttendedLectures = lecture
      .filter(
        (lec) => Array.isArray(lec.attendance) && lec.attendance.length > 0
      )
      .sort(
        (a, b) =>
          new Date(b.attendance[0].actualStartTime) -
          new Date(a.attendance[0].actualStartTime)
      )
      .slice(0, 5);
    // console.log(last5AttendedLectures)

    const penaltyCount = lecture.reduce(
      (acc, lec) => {
        lec.attendance?.forEach((att) => {
          if (!att.penalty || att.penalty === "NONE") return;

          acc[att.penalty] += 1;
          acc.total += 1;
        });

        return acc;
      },
      {
        LATE_START: 0,
        EARLY_END: 0,
        BOTH: 0,
        total: 0,
      }
    );

    setPenalty(penaltyCount);
    setAttendance(last5AttendedLectures);
  }, [lecture]);

  const formatTime = (isoTime) => {
    if(!isoTime) return "";
    const date = new Date(isoTime.replace("Z","")) 
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const monlist = [
    "January",
    "Feburary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  //   const handleSendWhatsappMsg = () => {
  //     const message = `
  // *Faculty Monthly Summary*

  // *Name*: ${faculty.name}
  // *Branch*: ${faculty.branch.name}
  // *Month*: ${monlist[new Date().getMonth()]}

  // *Total Lectures*: ${lecture.reduce(
  //       (count, lec) => count + lec.TotalScheduled,
  //       0
  //     )}
  // *Lectures Conducted*: ${lecture.reduce(
  //       (count, lec) => count + (lec.attendance ? 1 : 0),
  //       0
  //     )}
  // *Remaining*: ${
  //       lecture.reduce((count, lec) => count + lec.TotalScheduled, 0) -
  //       lecture.reduce((count, lec) => count + (lec.attendance ? 1 : 0), 0)
  //     }

  // *Penalties*:
  // • *Late Start*: ${penalty.LATE_START}
  // • *Early End*: ${penalty.EARLY_END}
  // • *Both*: ${penalty.BOTH}

  //   `.trim();

  //     // 918160250887

  //     const whatsappURL = `https://wa.me/918160250887/?text=${encodeURIComponent(
  //       message
  //     )}`;
  //     window.open(whatsappURL, "_blank");
  //   };

  return (
    <>
      <div className="h-full bg-white m-2 rounded flex flex-col overflow-hidden">
        <div className="px-5 py-2 flex justify-between">
          <h1 className="font-bold text-2xl">Welcome 👋</h1>
        </div>

        <div className="w-[98%] xl:h-[92%]  mx-auto flex flex-col gap-4 overflow-auto xl:overflow-hidden ">
          <div className="flex flex-wrap justify-center xl:grid xl:grid-cols-4 gap-3 xl:w-full [&>div]:rounded [&>div]:shadow-lg xl:grid-rows-1 xl:h-[20vh] [&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div]:items-center [&>div>h1]:text-lg xl:[&>div>h1]:text-2xl [&>div>h1]:font-semibold [&>div>h1]:uppercase [&>div>p]:text-sm xl:[&>div>p]:text-lg [&>div>p]:font-medium [&>div>p]:text-gray-600  [&>div>h1]:text-gray-800 [&>div]:border ">
            <div className="bg-gray-200 p-2 xl:p-2 xl:w-full xl:h-full  ">
              <h1>Total Lectures</h1>
              <p>
                {lecture.reduce(
                  (count, lec) => count + lec.TotalScheduled,
                  0
                ) || 0}
              </p>
            </div>

            <div className="bg-gray-200 p-2 xl:p-2 xl:w-full xl:h-full  ">
              <h1>Remaining Lecture</h1>
              <p>
                {lecture.reduce((count, lec) => count + lec.TotalScheduled, 0) -
                  lecture.reduce((count, lec) => {
                    if (!Array.isArray(lec.attendance)) return count;

                    const conductedCount = lec.attendance.filter(
                      (att) => att.status === "CONDUCTED"
                    ).length;

                    return count + conductedCount;
                  }, 0)}
              </p>
            </div>

            <div className="bg-gray-200 p-2 xl:p-2 xl:w-full xl:h-full  ">
              <h1>Total Penalties</h1>
              <p>
                {lecture.reduce((count, lec) => {
                  if (!Array.isArray(lec.attendance)) return count;

                  const penaltiesInLecture = lec.attendance.filter(
                    (att) => att.penalty && att.penalty !== "NONE"
                  ).length;

                  return count + penaltiesInLecture;
                }, 0)}
              </p>
            </div>

            <div className="bg-gray-200 p-2 xl:p-2 xl:w-full xl:h-full  ">
              <h1>Salary</h1>
              <p className="flex">
                ₹
                {faculty?.facultyType === "LECTURE_BASED" ? (
                  <>
                    {faculty.lectureRate}{" "}
                    <span className="text-[10px] mt-1">Per Lecture</span>
                  </>
                ) : (
                  <>
                    {faculty.salary}{" "}
                    <span className="text-[10px] mt-1">Per Month</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex xl:flex-wrap flex-col xl:flex-row gap-3 [&>div]:border ">
            <div className="xl:w-[30vw] h-[50vh] bg-gray-100 rounded m-1 shadow-lg overflow-hidden p-2">
              <h1 className="text-xl font-semibold">Today's Lecture</h1>
              <div className="w-full h-full  [&>ul]:grid [&>ul]:grid-cols-3 flex flex-col [&>ul]:gap-10  mt-5 [&>ul]:text-center ">
                <ul className="font-bold mb-5">
                  <li>Subject</li>
                  <li>Start Time</li>
                  <li>End Time</li>
                </ul>
                {lecture.map((item, i) => (
                  <ul key={i} className="bg-[#ffffff] my-1 rounded p-1">
                    <li className="">{item?.subject?.name}</li>
                    <li>{formatTime(item?.startTime)}</li>
                    <li>{formatTime(item?.endTime)}</li>
                  </ul>
                ))}
              </div>
            </div>

            <div className="xl:w-[50vw] h-[50vh] bg-gray-100 rounded m-1 shadow-lg overflow-hidden p-2">
              <h1 className="text-xl font-semibold">
                Lecture History (Last 5 Lectures)
              </h1>
              <div className={`w-full h-full overflow-auto  [&>ul]:grid [&>ul]:grid-cols-[100px_180px_260px_220px_140px_140px]  ${faculty.facultyType === "LECTURE_BASED"?" [&>ul]:grid [&>ul]:grid-cols-[100px_180px_260px_220px_140px_140px] xl:[&>ul]:grid-cols-6":"[&>ul]:grid [&>ul]:grid-cols-[100px_180px_260px_220px_140px_140px] xl:[&>ul]:grid-cols-5"} flex flex-col [&>ul]:gap-10  mt-5 [&>ul]:text-center `}>
                <ul className="font-bold mb-5 [&>li]:font-semibold">
                  {(faculty.facultyType === "SALARY_BASED"
                    ? lecturehistory.filter((h) => h !== "Actual Time")
                    : lecturehistory
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                {/* {lecture.map((item, i) => (
                  <ul key={i} className="bg-[#ffffff] my-1 rounded p-1">
                    <li className="">{item.date}</li>
                    <li>{item.subject}</li>
                    <li>{item.planned}</li>
                    <li>{item.actual}</li>
                    <li>{item.status}</li>
                    <li>{item.penalty}</li>
                  </ul>
                ))} */}

                {attendances.map((item, i) => {
                  const attendance = item.attendance[0];

                  return (
                    <ul key={i} className="xl:bg-white my-1 rounded p-1">
                      <li>{formatDate(item.StartDate)}</li>
                      <li>{item.subject?.name}</li>
                      <li>
                        {formatTime(item.startTime)} –{" "}
                        {formatTime(item.endTime)}
                      </li>
                      {faculty.facultyType === "LECTURE_BASED" && (
                        <li>
                          <>
                            {formatTime(attendance.actualStartTime)} –{" "}
                            {formatTime(attendance.actualEndTime)}
                          </>
                        </li>
                      )}
                      <li className="text-green-600">Conducted</li>
                      <li>{attendance.penalty}</li>
                    </ul>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="w-[98%] ml-1 p-2 rounded border bg-gray-100 [&>h1]:text-xl flex [&>h1]:px-2 [&>h1]:border-r-2 [&>h1]:border-gray-300  ">
            <h1 className="border-r-0!">Penalty -{">"}</h1>
            <h1 className="">Late: {penalty.LATE_START}</h1>
            <h1 className="">Early: {penalty.EARLY_END}</h1>
            <h1 className="border-r-0!">Both: {penalty.BOTH}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacMain;
