"use client";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { mainRoute } from "../apiroute";

const StaffSalary = () => {
  const list = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
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

  const salaryTableHeaders = [
    "Date",
    "In Time",
    "Out Time",
    "Late",
    "Overtime (mins)",
    "Overtime Pay (₹)",
    "Late Duration (mins)",
    "Penalty",
  ];

  const formatTime = (iso) =>{
    if(!iso) return "";

    const date = new Date(iso)

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const [staffData, setStaffData] = useState({});

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salaryTableData, setSalaryTableData] = useState([]);

  useEffect(() => {
    console.log(selectedMonth);
    let tokn = JSON.parse(localStorage.getItem("user"));
    let token = tokn.data.token;
    // setBranch(tokn.data.user.branch);

    const loadData = async () => {
      const { data } = await axios.get(
        `${mainRoute}/api/users/role/dash?userId=${tokn.data.user.id}&branchId=${tokn.data.user.branch.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const facultyData = data.data.faculty;
      console.log(facultyData);

      setStaffData(facultyData[0]);
    };

    loadData();
  }, []);

  useEffect(() => {
    console.log(staffData.staffAttendances);
    const monthAttendances =
      staffData?.staffAttendances?.filter((att) => {
        const d = new Date(att.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectYear;
      }) || [];

    console.log(monthAttendances);
    const salaryTableData = monthAttendances.map((att) => ({
      date: formatDate(att.date),
      inTime: formatTime(att.actualInTime),
      outTime: att.actualOutTime ? formatTime(att.actualOutTime) : "-",
      late: att.isLate ? "Yes" : "No",
      overtimeMinutes: att.overtimeMinutes || 0,
      overtimePay: att.overtimePay || 0,
      totalPenalty: att.totalPenalty || 0,
      lateMinutes: att.lateMinutes,
    }));
    console.log(salaryTableData);

    setSalaryTableData(salaryTableData);
  }, [selectedMonth, staffData,selectYear]);

  return (
    <>
      <div className="h-full bg-white m-2 gap-2 rounded flex flex-col overflow-hidden p-5">
        {/* filter */}
        <div className="w-full flex justify-end p-2  gap-2">
          <Label htmlFor={`Sort`} className={`uppercase`}>
            SortBy:
          </Label>
          <Select
            value={list[selectedMonth]}
            onValueChange={(v) => setSelectedMonth(list.indexOf(v))}
          >
            <SelectTrigger id={`Sort`}>
              <SelectValue placeholder={`SortBy`} />
            </SelectTrigger>
            <SelectContent>
              {list.map((item, i) => (
                <SelectItem key={i} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectYear}
            onValueChange={(v) => setSelectedYear(v)}
          >
            <SelectTrigger id={`Sort`}>
              <SelectValue placeholder={`SortBy`} />
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
        {/* summary card */}
        <div className="flex gap-4">
          <div className="bg-gray-100 w-[98%] xl:h-[20vh] xl:w-[30vw] rounded p-2 py-4 flex flex-col justify-between relative">
            <h1 className="font-semibold text-xl">
              Net OverTime Pay(Current month)
            </h1>
            <p className="text-6xl text-green-600">
              ₹
              {salaryTableData.reduce(
                (sum, att) => sum + (att.overtimePay || 0),
                0
              )}
            </p>
          </div>
          <div className="bg-gray-100 w-[98%] xl:h-[20vh] xl:w-[30vw] rounded p-2 py-4 flex flex-col justify-between relative">
            <h1 className="font-semibold text-xl">
              Net Penalties Pay(Current month)
            </h1>
            <p className="text-6xl text-red-600">
              ₹
              {salaryTableData.reduce(
                (sum, att) => sum + (att.totalPenalty || 0),
                0
              )}
            </p>
          </div>
        </div>
        {/* OverTime table */}

        <div className="bg-gray-100 h-[91%]  overflow-auto w-[98%] rounded p-2 py-4 flex flex-col xl:justify-start relative">
          <h1 className=" font-semibold uppercase">Overtimes</h1>
          <ul className="grid  grid-cols-[100px_180px_260px_220px_140px_140px_150px_150px] xl:grid-cols-8 text-center border-b p-2 font-semibold">
            {salaryTableHeaders.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {salaryTableData.map((item, i) => (
            <ul
              key={i}
              className="grid grid-cols-[100px_180px_260px_220px_140px_140px_150px_150px] xl:grid-cols-8 text-center border-b p-2"
            >
              <li>{item.date}</li>
              <li>{item.inTime}</li>
              <li>{item.outTime}</li>
              <li>{item.late}</li>
              <li>{item.overtimeMinutes}</li>
              <li
                className={`${
                  item.overtimePay > 0 ? "text-green-600 font-semibold" : ""
                }`}
              >
                ₹{item.overtimePay}
              </li>
              <li>{item.lateMinutes}</li>
              <li
                className={`${
                  item.totalPenalty > 0 ? "text-red-600 font-semibold" : ""
                }`}
              >
                ₹{item.totalPenalty}
              </li>
            </ul>
          ))}
        </div>
      </div>
    </>
  );
};

export default StaffSalary;
