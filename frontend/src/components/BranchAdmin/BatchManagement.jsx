"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { mainRoute } from "../apiroute";
import BatchModels from "./Modal/BatchModels";

const BatchManagement = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [bran, setBran] = useState({});
  const [badmin, setBadmin] = useState("");

  const lists = [
    "S.no",
    "Batch Name",
    "Course Name",
    "Branch Name",
    "Total Lectures",
    "Edit",
    "Delete",
  ];

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const token = tok.data.token;

    const fetchBranches = async () => {
      const { data } = await axios.get(`${mainRoute}/api/batch`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(data.data);
      const filterdata = data.data.filter((dat) => dat.course.branchId === tok.data.user.branchId)
      setBranches(filterdata);
    };

    fetchBranches();
  }, []);

  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 flex-col items-center "> */}
      <div className="h-full bg-white m-2 rounded flex flex-col items-center p-4 py-6 overflow-hidden">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 `}
            onClick={() => {
              setOpen(true);
              setType("add");
            }}
          >
            Add Batch
          </Button>
        </div>
        <div className="w-full overflow-auto">
          <ul className="grid grid-cols-7 xl:px-4 text-sm py-3 border-b border-gray-500 font-bold text-center">
            {lists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {branches.length > 0 ? (
            branches.map((branche, index) => {
              const branchAdmin = branche?.branch?.users?.find(
                (user) => user.role === "BRANCH_ADMIN"
              );

              return (
                <ul
                  key={branche.id}
                  className="grid grid-cols-7 text-sm xl:text-[1rem] px-4 py-3 border-b border-gray-500 text-center items-center hover:bg-gray-100"
                >
                  <li className="font-semibold">{index + 1}</li>
                  <li>{branche.name}</li>

                  {/* <li>
                    {branche?.branch?.users?.filter((u) => u.role === "FACULTY")
                      .length || 0}
                  </li>

                  <li>
                    {branche?.branch?.users?.filter((u) => u.role === "STAFF")
                      .length || 0}
                  </li> */}
                  <li>{branche?.course?.name}</li>
                  <li>{branche?.course?.branch?.name}</li>

                  <li>
                    {branche?.lectureSchedules?.reduce(
                      (sum, lec) => sum + lec?.TotalScheduled,
                      0
                    ) || "-"}
                  </li>

                  {/* <li>
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(true);
                        setType("assign");
                        setBran(branche);
                      }}
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Assign
                    </Button>
                  </li> */}

                  <li>
                    <Button
                      onClick={() => {
                        setType("edit");
                        setBran(branche);
                        setOpen(true);
                        setBadmin(branchAdmin);
                      }}
                      size="sm"
                      variant="secondary"
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Edit
                    </Button>
                  </li>

                  <li>
                    <Button
                      onClick={() => {
                        setType("delete");
                        setBran(branche);
                        setOpen(true);
                        setBadmin(branchAdmin);
                      }}
                      size="sm"
                      variant="destructive"
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Delete
                    </Button>
                  </li>
                </ul>
              );
            })
          ) : (
            <p className="text-center my-5 text-xl">No Batches</p>
          )}
        </div>
      </div>

      <BatchModels
        open={open}
        setOpen={setOpen}
        type={type}
        branch={bran}
        badmin={badmin}
      />
    </>
  );
};

export default BatchManagement;
