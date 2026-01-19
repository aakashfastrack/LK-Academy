"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import ActionButton from "./ActionButton";
import UserModal from "./Models/UserModal";
import axios from "axios";
import { mainRoute } from "../apiroute";

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [us, setUs] = useState({});

  const [users, setUser] = useState([]);

  const lists = [
    "S.no",
    "Name",
    "Phone Number",
    "Role",
    "Branch",
    "Salary",
    "Created On",
    "Actions",
  ];

  const fetchUser = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/users/allusers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(data.data);
    console.log();

    const filterdata = data.data.filter((user) => user.id !== tok.data.user.id);
    console.log(filterdata);
    setUser(filterdata);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const formatRole = (role) => {
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  const ActivateUser = async (Id) => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.put(`${mainRoute}/api/users/activate/${Id}`,{
      id:Id
    } , {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchUser()
  };

  return (
    <>
      <div className="h-[91%]  bg-white m-2 rounded flex flex-col gap-5 p-4 py-6 overflow-y-auto overflow-x-auto ">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 `}
            onClick={() => {
              setOpen(true);
              setType("add");
            }}
          >
            Add New User
          </Button>
        </div>
        <ul className="grid grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px] px-4 pt-3 xl:border-b xl:border-gray-500 font-bold text-center">
          {lists.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="w-full pb-10">
          {users.length > 0 ? (
            users.map((user, index) => {
              if (
                user.id ===
                JSON.parse(localStorage.getItem("user")).data.user.id
              )
                return;

              return (
                <ul
                  key={index}
                  className={`grid grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px] px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50 ${user.isActive ? "bg-white" : "bg-gray-100"}`}
                >
                  <li className="font-semibold">{index + 1}</li>
                  <li className="flex items-center justify-center gap-2">
                    {user.name}{" "}
                    <div
                      className={`${user.isActive ? "" : "bg-red-500  h-2 w-2 rounded-full "}`}
                    ></div>
                  </li>
                  <li>{user.phoneNumber}</li>
                  <li>{formatRole(user.role)}</li>
                  <li>{user.branch?.name || "-"}</li>
                  <li>
                    {user.facultyType === "LECTURE_BASED"
                      ? user.lectureRate
                      : user.salary}
                  </li>
                  <li>{user.createdAt.split("T")[0]}</li>
                  <li className="flex justify-center">
                    {user.isActive ? (
                      <>
                        <ActionButton
                          user={user}
                          setUs={setUs}
                          setOp={setOpen}
                          type={type}
                          setType={setType}
                        />
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={()=>{ActivateUser(user.id)}}
                          className={`cursor-pointer`}
                        >
                          Activate
                        </Button>
                      </>
                    )}
                  </li>
                </ul>
              );
            })
          ) : (
            <div className="h-[50vh] flex justify-center items-center">
              <p className="text-center my-5 text-xl">No Users</p>
            </div>
          )}
        </div>
      </div>
      <UserModal
        open={open}
        setOpen={setOpen}
        type={type}
        user={us}
        refetch={fetchUser}
      />
    </>
  );
};

export default UserManagement;
