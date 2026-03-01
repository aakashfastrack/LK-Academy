'use client'
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useManagement } from "@/context/ManagementContext";
import axios from "axios";
import { mainRoute } from "../apiroute";

const FacLecture = () => {
  // const subject = ["Maths", "Physics", "Chemistry"];

  const myLectureHeaders = [
    "Sno.",
    "Subject",
    "Planned Time",
    "Actual Time",
    "Start Date",
    "End Date",
  ];

//   const myLecturesData = [
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

const {fetchLecture,fetchSubject} = useManagement()

 const formatTime = (isoTime) => {
  if(!isoTime) return "";
  const date = new Date(isoTime)
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
const [myLecturesData,setLectureData] = useState([])


  useEffect(()=>{
    const tok = JSON.parse(localStorage.getItem("user"))
    const id = tok.data.user.id
    console.log(tok.data.user)
    const loadData = async() =>{
      const {data} = await axios.get(`${mainRoute}/api/lecture/lec?id=${id}`,{
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${tok.data.token}`
        }
      })

      const filterData = data.data
      console.log(filterData)
      setLectureData(filterData)

    }
    loadData();
  },[])

  return (
    <>
      <div className="h-full bg-white m-2 rounded flex flex-col overflow-auto items-center">
        {/* filter */}
        {/* <div className="w-[98%] flex p-2 items-center justify-center gap-2 border-b-[1] mx-2">
          <h1 className="text-lg uppercase font-semibold">Filter:</h1>
          <Select>
            <SelectTrigger className={`w-[30%]`}>
              <SelectValue placeholder={`Subject`} />
            </SelectTrigger>
            <SelectContent>
              {myLecturesData.map((item, i) => (
                <SelectItem key={i} value={item.subject.id}>
                  {item.subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input type={`date`} className={`w-[30%]`} />
          <Button>Apply</Button>
        </div> */}

        {/* Lecture List */}
        <div className="w-[98%] h-full overflow-y-auto xl:overflow-x-hidden">
          <ul className="grid grid-cols-[100px_180px_260px_220px_140px_140px] xl:grid-cols-6 text-center border-b p-2 font-semibold">
            {
                myLectureHeaders.map((item,i)=>(
                    <li key={i}>{item}</li>
                ))
            }
          </ul>

          {
            myLecturesData.map((item,i)=>(
                <ul key={i} className="grid grid-cols-[100px_180px_260px_220px_140px_140px] xl:grid-cols-6 text-center border-b p-2" >
                    <li>{i + 1}</li>
                    <li>{item.subject?.name}</li>
                    <li>{formatTime(item.startTime)}</li>
                    <li>{formatTime(item.endTime)}</li>
                    <li>{formatDate(item.StartDate)}</li>
                    <li>{formatDate(item.EndDate)}</li>
                </ul>
            ))
          }

          
        </div>
      </div>
    </>
  );
};

export default FacLecture;
