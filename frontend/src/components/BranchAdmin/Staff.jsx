"use client";
import { useManagement } from "@/context/ManagementContext";
import React, { useEffect, useState } from "react";

const Staff = () => {
  const staffHeaders = [
    "Staff Name",
    "Email",
    "Shift Time",
    "End Time",
    "Days Present",
    "Late Days",
    "Overtime (mins)",
    "Overtime Pay (₹)",
  ];

  const { fetchUser } = useManagement();

  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    const loaddata = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const branchId = user.data.user.branchId;
      console.log(branchId);

      const userDate = await fetchUser();

      const filterData = userDate
        .filter((user) => user.role === "STAFF")
        .filter((user) => user.branchId === branchId);
      console.log(filterData)
      setStaffData(filterData);
    };

    loaddata();
  }, []);

  const formatTime = (isoTime) => {
    if(!isoTime) return "";
    const date = new Date(isoTime.replace("Z",""))
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="h-[91%] bg-white m-2 rounded p-4 py-6 flex flex-wrap gap-5 flex-col items-center">
        <div className="w-full h-[99%] overflow-auto xl:overflow-x-hidden">
          <ul
            className="grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px]
          px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center "
          >
            {staffHeaders.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {staffData.map((staff, i) => (
            <ul
              key={i}
              className="grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px] px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center text-wrap hover:bg-gray-50"
            >
              <li>{staff.name}</li>
              <li>{staff.phoneNumber}</li>
              <li>{formatTime(staff.shiftStartTime)}</li>
              <li>{formatTime(staff.shiftEndTime)}</li>
              <li>{staff.staffAttendances?.length || 0}</li>
              <li>{staff.staffAttendances.filter((data)=>data.isLate === true).length || 0}</li>
              <li>{staff.staffAttendances.reduce((count,overtime)=> count + (overtime.overtimeMinutes ||0),0 ) || "-"}</li>
              <li className="text-green-600 font-semibold">
                ₹{staff.staffAttendances.reduce((count,overtime)=> count + (overtime.overtimePay ||0),0 )||"0"}
              </li>
            </ul>
          ))}
        </div>
      </div>
    </>
  );
};

export default Staff;
