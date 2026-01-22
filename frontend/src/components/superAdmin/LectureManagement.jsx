"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import ActionButton from "./ActionButton";
import LectureModal from "./Models/LectureModal";
import axios from "axios";
import { mainRoute } from "../apiroute";

const LectureManagement = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");

  const [lectureData, setLectureData] = useState([]);

  const [lec, setLectures] = useState({});

  const fetchLecture = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;

    const { data } = await axios.get(`${mainRoute}/api/lecture`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(data.data);

    setLectureData(data.data);
  };

  useEffect(() => {
    fetchLecture();
  }, []);

  const lists = [
    "Start Date",
    "End Date",
    "Subject",
    "Faculty",
    "Batch",
    "Course",
    "Branch",
    "Start Time",
    "End Time",
    "Actions",
  ];

  function formatTime(isoIst) {
    console.log(isoIst)
    if (!isoIst) return "";

    // 🔥 remove Z so JS treats it as local time
    const safeIso = isoIst.replace("Z", "");

    const date = new Date(safeIso);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const toAmPm = (isoIst) => {
    return new Date(isoIst).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 flex-col items-center "> */}
      <div className="h-[91%] bg-white m-2 rounded flex flex-col overflow-hidden gap-5 p-4 py-6 flex-wrap ">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 cursor-pointer `}
            onClick={() => {
              setOpen(true);
              setType("create");
            }}
          >
            Add New Lecture
          </Button>
        </div>
        <div className="w-full h-[91%] overflow-y-auto overflow-x-auto xl:overflow-x-hidden pb-10">
          <ul className="grid grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px_100px]  xl:grid-cols-10 px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
            {lists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {lectureData.length > 0 ? (
            lectureData.map((lecture, index) => {
              return (
                <ul
                  key={index}
                  className="grid  grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px_100px] xl:grid-cols-10 px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50"
                >
                  {/* <li className="font-semibold">{index + 1}</li> */}
                  <li>{lecture.StartDate.split("T")[0]}</li>
                  <li>{lecture.EndDate.split("T")[0]}</li>
                  <li>{lecture.subject.name}</li>
                  <li>{lecture.faculty.name}</li>
                  <li>{lecture.batch.name}</li>
                  <li>{lecture.batch.course.name}</li>
                  <li>{lecture.batch.course.branch.name}</li>
                  <li>{formatTime(lecture.startTime)}</li>
                  {/* <li>{lecture.endTime.split("T")[1].split(":00")[0]}</li> */}
                  <li>{formatTime(lecture.endTime)}</li>
                  <li className="flex justify-center">
                    <ActionButton
                      user={lecture}
                      // needed={true}
                      setOp={setOpen}
                      setUs={setLectures}
                      setType={setType}
                    />
                  </li>
                </ul>
              );
            })
          ) : (
            <p className="text-center my-5 text-xl">No Lecture</p>
          )}
        </div>
      </div>
      <LectureModal
        refetch={fetchLecture}
        open={open}
        setOpen={setOpen}
        type={type}
        lec={lec}
      />
    </>
  );
};

export default LectureManagement;
