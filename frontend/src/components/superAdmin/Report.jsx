"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useManagement } from "@/context/ManagementContext";
import ReportModels from "./Models/ReportModels";

const Report = () => {
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("FACULTY");
  const [branch, setBranch] = useState([]);
  const [bran, setBran] = useState(null);

  const facultyReportHeaders = [
    "id",
    "Faculty Name",
    "Subjects",
    "Lectures Done",
    "Remaining Lectures",
    "Late",
    "Early",
    "Both",
    "Total Penalty",
  ];

  const getCurrentMonthRange = () => {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return { startOfMonth, endOfMonth };
  };

  const getCurrentMonthStaffAttendances = (staffAttendances) => {
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    return staffAttendances.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= startOfMonth && attDate <= endOfMonth;
    });
  };

  const getStaffStats = (staffAttendances) => {
    const currentMonthData = getCurrentMonthStaffAttendances(staffAttendances);

    return currentMonthData.reduce(
      (acc, att) => {
        acc.daysPresent += 1;

        if (att.isLate) {
          acc.lateDays += 1;
          acc.totalLateMinutes += att.lateMinutes || 0;
        }

        acc.totalOvertimeMinutes += att.overtimeMinutes || 0;
        acc.totalOvertimePay += att.overtimePay || 0;
        acc.totalPenalty += att.totalPenalty || 0;

        return acc;
      },
      {
        daysPresent: 0,
        lateDays: 0,
        totalLateMinutes: 0,
        totalOvertimeMinutes: 0,
        totalOvertimePay: 0,
        totalPenalty: 0,
      }
    );
  };

  const [facultyReportData, setFacultyReportData] = useState([]);
  const [staffReportData, setStaffReportData] = useState([]);
  const { fetchUser, fetchBranch } = useManagement();

  useEffect(() => {
    const loadData = async () => {
      const branchdata = await fetchBranch();

      setBranch(branchdata);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (role === "FACULTY") {
      const loadData = async () => {
        const data = await fetchUser();
        let filterData = data.filter((user) => user.role === "FACULTY");
        if (bran) {
          const fdata = filterData.filter((user) => user.branchId === bran);
          console.log(fdata);
          setFacultyReportData(fdata);
        } else {
          setFacultyReportData(filterData);
        }
      };
      loadData();
    }

    if (role === "STAFF") {
      const loadData = async () => {
        const data = await fetchUser();
        const filterData = data.filter((user) => user.role === "STAFF");
        if (bran) {
          const fdata = filterData.filter((user) => user.branchId === bran);
          setStaffReportData(fdata);
        } else {
          console.log(filterData);
          setStaffReportData(filterData);
        }
      };
      loadData();
    }
  }, [role, bran]);

  const staffReportHeaders = [
    "id",
    "Staff Name",
    "Days Present",
    "Late Days",
    "Total Late Minutes",
    "Total Overtime (mins)",
    "Overtime Pay (₹)",
    "Total Penalty",
  ];

  const getLectureAttendanceStats = (lectures) => {
    let conducted = 0;
    let late = 0;
    let early = 0;
    let both = 0;
    let totalPenalty = 0;
    let totalScheduled = 0;
    let subject = [];

    lectures.forEach((lec) => {
      totalScheduled += lec.TotalScheduled || 0;

      subject.push(lec?.subject?.name)

      lec.attendance.forEach((att) => {
        conducted++;

        if (att.penalty === "LATE_START") late++;
        if (att.penalty === "EARLY_END") early++;
        if (att.penalty === "BOTH") both++;
        if (att.penalty !== "NONE") totalPenalty++;
      });
    });

    return {
      conducted,
      remaining: totalScheduled - conducted,
      late,
      early,
      both,
      totalPenalty,
      subject
    };
  };

  return (
    <>
      <div className=" rounded h-[91%] bg-white m-2 overflow-hidden p-4">
        <div className="flex gap-4 border-b-2 pb-2">
          <p className="text-xl font-semibold">Filter: </p>
          <Select value={role} onValueChange={(v) => setRole(v)}>
            <SelectTrigger className={`w-45`}>
              <SelectValue placeholder={"Role"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`FACULTY`}>Faculty</SelectItem>
              <SelectItem value={`STAFF`}>Staff</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setBran(v)}>
            <SelectTrigger className={`w-45`}>
              <SelectValue placeholder={"Branch"} />
            </SelectTrigger>
            <SelectContent>
              {branch.map((item, i) => (
                <SelectItem key={i} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
              <SelectItem value={null}>None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {role === "STAFF" && (
          <div className="h-[92%] w-full overflow-auto xl:overflow-x-hidden">
            <ul className="grid grid-cols-[60px_180px_260px_220px_140px_140px_140px_140px] xl:grid-cols-8  px-4 py-3 xl:border-b border-gray-500 font-bold text-center">
              {staffReportHeaders.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {staffReportData.map((staff, index) => {
              const stats = getStaffStats(staff.staffAttendances);
              return (
                <ul
                  onClick={() => {
                    setOpen(true);
                    setUser(staff);
                  }}
                  key={index}
                  className="grid grid-cols-[60px_180px_260px_220px_140px_140px_140px_140px] xl:grid-cols-8 px-4 py-3 xl:border-b border-gray-500 text-center items-center hover:bg-gray-50"
                >
                  <li className="font-semibold">{index + 1}</li>
                  <li>{staff.name}</li>
                  <li>{stats.daysPresent}</li>
                  <li>{stats.lateDays}</li>
                  <li>{stats.totalLateMinutes}</li>
                  <li>{stats.totalOvertimeMinutes}</li>
                  <li className="text-green-600 font-semibold">
                    ₹{stats.totalOvertimePay}
                  </li>
                  <li className="text-red-600 font-semibold">
                    ₹{stats.totalPenalty}
                  </li>
                </ul>
              );
            })}
          </div>
        )}
        {role === "FACULTY" && (
          <div className=" h-[94%] w-full overflow-auto">
            <ul className="grid grid-cols-[60px_180px_200px_260px_220px_140px_140px_120px_100px] xl:grid-cols-9  px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
              {facultyReportHeaders.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {facultyReportData.map((staff, index) => {
              const stats = getLectureAttendanceStats(staff.lectures);

              return (
                <ul
                onClick={()=>{
                  setOpen(true);
                  setUser(staff);
                }}
                  key={index}
                  className="grid grid-cols-[60px_180px_200px_260px_220px_140px_140px_120px_100px] xl:grid-cols-9 px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50"
                >
                  <li className="font-semibold">{index + 1}</li>
                  <li>{staff.name}</li>
                  <li>{stats.subject.join(", ")}</li>
                  <li>{stats.conducted}</li>
                  <li>{stats.remaining}</li>
                  <li>{stats.late}</li>
                  <li>{stats.early}</li>
                  <li>{stats.both}</li>
                  <li>{stats.totalPenalty}</li>
                </ul>
              );
            })}
          </div>
        )}
      </div>

      <ReportModels open={open} setOpen={setOpen} user={user} setUser={setUser} />
    </>
  );
};

export default Report;
