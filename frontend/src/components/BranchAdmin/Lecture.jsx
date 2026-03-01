'use client'
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ActionBtn from "./ActionBtn";
import LectureCreateModal from "./Modal/LectureCreateModal";
import { useManagement } from "@/context/ManagementContext";

const Lecture = () => {

    const [createOpen,setCreateOpen] = useState(false)
    const [type, setType] = useState("")
    const [lecu,setLecture] = useState({})

  const branchLectureHeaders = [
    "Start Date",
    "End Date",
    "Subject",
    "Faculty",
    "In Time",
    "Out Time",
    "Created On",
    "Actions",
  ];


  const [branchLectureData,setBranchLectureData] = useState([])

  const formatTime = (isoTime) => {
    if(!isoTime) return "";
    const date = new Date(isoTime)
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const {fetchLecture} = useManagement()

  const loaddata = async () => {
   const user = JSON.parse(localStorage.getItem("user"));
   const branchId = user.data.user.branchId;

   const userDate = await fetchLecture();
   console.log(userDate)
   const filterData = userDate
     .filter((user) => user.batch.course.branchId === branchId);
   console.log(filterData)
   setBranchLectureData(filterData);
 };
  useEffect(()=>{

    loaddata();
  },[])

  return (
    <>
      <div className="h-[91%] rounded bg-white m-2  p-4 py-2 flex flex-wrap gap-5 flex-col items-center">
        <div className="w-full flex justify-end">
          <Button
            className={`cursor-pointer bg-green-600 text-gray-200 hover:text-gray-100 hover:bg-green-700 `}
            onClick={()=>{setCreateOpen(true);setType("create")}}
          >
            Create New Lecture
          </Button>
        </div>

        <div className="w-full h-[91%] overflow-auto">
          <ul className="grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px] xl:grid-cols-8  px-4 py-3 xl:border-b border-gray-500 font-bold text-center">
            {branchLectureHeaders.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {branchLectureData.map((lec,index)=>(
            <ul key={index} className={`grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px] xl:grid-cols-8 px-4 py-3 xl:border-b border-gray-500 text-center items-center text-wrap hover:bg-gray-50`} >
                <li>{lec.StartDate.split("T")[0]}</li>
                <li>{lec.EndDate.split("T")[0]}</li>
                <li>{lec.subject.name}</li>
                <li>{lec.faculty.name}</li>
                <li>{formatTime(lec.startTime)}</li>
                <li>{formatTime(lec.endTime)}</li>
                <li>{lec.createdAt.split("T")[0]}</li>
                <li>
                    <ActionBtn setType={setType} op={createOpen} setOp={setCreateOpen} type={type} lecu={lec} setlecture={setLecture} />
                </li>
            </ul>
          ))}
        </div>
      </div>
      <LectureCreateModal refetch={loaddata} lec={lecu} open={createOpen} setOpen={setCreateOpen} type={type}/>
    </>
  );
};

export default Lecture;
