"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { mainRoute } from "../apiroute";

const Dash = () => {
  const [faculty, setFaculty] = useState([]);
  const [staff, setStaff] = useState([]);
  const [branch, setBranch] = useState({});
  const [lecture, setLecture] = useState([]);
  const [branchData, setBranchData] = useState({});
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    let tokn = JSON.parse(localStorage.getItem("user"));
    let token = tokn.data.token;
    setBranch(tokn.data.user.branch);

    const loadData = async () => {
      const { data } = await axios.get(`${mainRoute}/api/users/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(data.data);
      const facultyData = data.data.faculty
        .filter((user) => user.role === "FACULTY")
        .filter((user) => user.branchId === tokn.data.user.branch.id);
      console.log(facultyData);
      const staffData = data.data.faculty
        .filter((user) => user.role === "STAFF")
        .filter((user) => user.branchId === tokn.data.user.branch.id);
      //   const branchData = data.data.branch;

      const lectur = data.data.lectures.filter(
        (lec) => lec.batch.course.branchId === tokn.data.user.branch.id,
      );

      const bran = data.data.branch.find(
        (branc) => branc.id === tokn.data.user.branch.id,
      );

      const bat = data.data.batch.filter(
        (b) => b.course.branchId === tokn.data.user.branch.id,
      );

      setBranchData(bran);
      setFaculty(facultyData);
      setStaff(staffData);
      setLecture(lectur);
      setBatches(bat);
    };

    loadData();
  }, []);

  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 justify-center [&>div]:bg-[#BE6B66]"> */}
      <div className="h-[91%] bg-white m-2 rounded xl:flex xl:flex-col gap-5 p-4 py-6">
        <div className="flex h-full flex-col xl:grid xl:grid-cols-4 gap-4 xl:gap-2 w-full xl:[&>div]:h-[40vh] xl:[&>div]:w-[20vw] overflow-y-auto xl:overflow-hidden ">
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Branch Name</h1>
            <p className="text-lg text-gray-600">{branch.name}</p>
          </div>

          {/* total Faculies */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Total Faculty</h1>
            <p className="text-lg text-gray-600">{faculty.length}</p>
          </div>

          {/* total Staff */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Total Staff</h1>
            <p className="text-lg text-gray-600">{staff.length}</p>
          </div>

          {/* total Lectures */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Total Lectures</h1>
            <p className="text-lg text-gray-600">
              {lecture?.reduce(
                (sum, lec) => sum + (lec.TotalScheduled || 0),
                0,
              )}
            </p>
          </div>

          {/* total Penalties
          <div className="h-[40%] w-[40%] rounded flex justify-center items-center flex-col text-gray-50 drop-shadow-2xl ">
            <h1 className="text-2xl">Total Penalties</h1>
            <p className="text-lg">205</p>
          </div> */}
          {/* <div className="grid grid-cols-4 gap-3 w-full [&>div]:rounded [&>div]:shadow-lg grid-rows-1 h-[20vh] [&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div]:items-center [&>div>h1]:text-2xl [&>div>h1]:font-semibold [&>div>h1]:uppercase [&>div>p]:text-lg [&>div>p]:font-medium [&>div>p]:text-gray-600 [&>div>h1]:text-gray-800 [&>div]:border  [&>div]:bg-gray-200 [&>div]:w-full [&>div]:h-full"> */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">
              Lectures Conducted
            </h1>
            <p className="text-lg text-gray-600">
              {lecture.reduce((count, lec) => {
                if (!Array.isArray(lec.attendance)) return count;
                return (
                  count +
                  lec.attendance.filter((att) => att.status === "CONDUCTED")
                    .length
                );
              }, 0)}
            </p>
          </div>

          {/* total Faculies */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Lectures Missed</h1>
            <p className="text-lg text-gray-600">
              {lecture.reduce((count, lec) => {
                if (!Array.isArray(lec.attendance)) return count;
                return (
                  count +
                  lec.attendance.filter((att) => att.status === "MISSED").length
                );
              }, 0)}
            </p>
          </div>

          {/* total Staff */}
          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Total Penalty</h1>
            <p className="text-lg text-gray-600">
              {lecture.reduce((count, lec) => {
                if (!Array.isArray(lec.attendance)) return count;
                return (
                  count +
                  lec.attendance.filter(
                    (att) => att.penalty && att.penalty !== "NONE",
                  ).length
                );
              }, 0)}
            </p>
          </div>

          <div className="rounded bg-gray-200 shadow-lg border flex flex-col justify-center items-center min-h-35">
            <h1 className="text-xl font-semibold uppercase">Total Batches</h1>
            <p className="text-lg text-gray-600">{batches?.length || 0}</p>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default Dash;
