"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { Button } from "../ui/button";

const Navbar = ({open,setOpen}) => {
  const params = usePathname();

  const lists = [
    {
      name: "Dashboard",
      icon: "",
      link: "/superadmin",
    },
    {
      name: "Branch Management",
      icon: "",
      link: "/superadmin/branchmanage",
    },
    {
      name:"Course Management",
      icon:"",
      link: "/superadmin/coursemanage"
    },
    {
      name:"Batch Management",
      icon:"",
      link:"/superadmin/batchmanage"
    },
    {
      name: "User Management",
      icon: "",
      link: "/superadmin/usermanage",
    },
    {
      name: "Subject Management",
      icon: "",
      link: "/superadmin/subjectmanage",
    },
    {
      name: "Lecture Management",
      icon: "",
      link: "/superadmin/lecturemanage",
    },
    {
      name: "Attendance",
      icon: "",
      link: "/superadmin/attendance",
    },
    {
      name: "Report",
      icon: "",
      link: "/superadmin/report",
    },
    {
      name:"Historical Data",
      icon:"",
      link:"/superadmin/uploadfile"
    },
    {
      name:"Profile",
      icon:"",
      link:"/superadmin/profile"
    },
  ];

    const handleLogout = () => {
      localStorage.removeItem("user");
      redirect("/");
    };

  return (
    <>
      <div className={`bg-white xl:flex xl:flex-col relative h-full overflow-hidden ${open ? "flex flex-col" : "hidden"} xl:w-[15vw] py-6 rounded-r-lg `}>
        <div className="flex items-center justify-between"> 
          <Image alt="logo" src={"/Header.jpg"} height={200} width={200} />
          <p onClick={()=>setOpen(false)} className="pr-10 font-bold text-3xl cursor-pointer xl:hidden">X</p>
        </div>
        <div className="h-[90%] overflow-auto">
          <ul className="relative px-2 xl:px-0 xl:pl-2 ">
            {lists.map((item, index) => (
              <li
                key={index}
                className={` text-lg my-5 py-2 pl-2 rounded-full  xl:rounded-none xl:rounded-l-full ${
                  params === item.link
                    ? "text-white bg-[#be6b66] w-full navbar"
                    : "text-black"
                }`}
              >
                <Link href={item.link}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full p-2 absolute bottom-0 left-0">
          <Button
            onClick={handleLogout}
            className={`w-full cursor-pointer bg-[#be6b66]`}
          >
            LogOut
          </Button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
