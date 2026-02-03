import React, { useEffect, useState } from "react";
import ActionButton from "../superAdmin/ActionButton";
import { Button } from "../ui/button";
import axios from "axios";
import { mainRoute } from "../apiroute";
import SubjectModel from "./Modal/SubjectModel";

const SubjectManagement = () => {
  const [open, setOpen] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [type, setType] = useState(false);
  const [subjec, setSubject] = useState({});

  const lists = [
    "S.no",
    "Subject Name",
    "Batch",
    "Course",
    "Branch",
    "Assigned Faculty",
    "No of Lectures",
    "Total Lectures",
    "Actions",
  ];

  const fetchSubject = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/subject`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const filterData = data.data.filter(
      (dat) => dat.batch.course.branchId === tok.data.user.branchId,
    );
    setSubjectData(filterData);
  };
  useEffect(() => {
    fetchSubject();
  }, []);
  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 flex-col items-center "> */}
      <div className="h-[91%] bg-white m-2 rounded flex flex-col overflow-hidden gap-5 p-4 py-6 flex-wrap ">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 `}
            onClick={() => {
              setOpen(true);
              setType("create");
            }}
          >
            Add New Subject
          </Button>
        </div>
        <div className="w-full h-[91%]  overflow-auto">
          <ul className="grid grid-cols-[30px_120px_180px_260px_220px_140px_140px_120px_100px_100px] xl:grid-cols-9 px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
            {lists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {subjectData.length > 0 ? (
            subjectData.map((sub, index) => (
              <ul
                key={index}
                className="grid grid-cols-[30px_120px_180px_260px_220px_140px_140px_120px_100px] xl:grid-cols-9 px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50"
              >
                <li className="font-semibold">{index + 1}</li>
                <li>{sub.name}</li>
                <li>{sub.batch.name}</li>
                <li>{sub.batch.course.name}</li>
                <li>{sub.batch?.course?.branch?.name}</li>
                <li>
                  {sub.facultySubjects.map((fs) => fs.faculty.name).join(",") ||
                    "-"}
                </li>
                <li>
                  {sub?.lectureSchedules.reduce(
                    (count, lec) =>
                      count + (lec.attendance ? lec.attendance.length : 0),
                    0,
                  ) || "-"}
                </li>
                <li>
                  {sub?.lectureSchedules.reduce(
                    (sum, sublec) => sum + (sublec?.TotalScheduled || 0),
                    0,
                  ) || "-"}
                </li>
                <li className="flex justify-center">
                  <ActionButton
                    user={sub}
                    edit={false}
                    // needed={true}
                    setOp={setOpen}
                    setUs={setSubject}
                    setType={setType}
                  />
                </li>
              </ul>
            ))
          ) : (
            <p className="text-center my-5 text-xl">No Subjects</p>
          )}
        </div>
      </div>

      <SubjectModel 
        subject={subjec}
        open={open}
        setOpen={setOpen}
        type={type}
        refetch={fetchSubject}
      />
    </>
  );
};

export default SubjectManagement;
