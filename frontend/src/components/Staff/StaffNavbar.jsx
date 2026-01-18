"use client";
import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";

const StaffNavbar = ({open,setOpen}) => {
  const pathname = usePathname();

  const lists = [
    {
      name: "Dashboard",
      icon: "",
      link: "/staff",
    },
    {
      name: "My Attendance",
      icon: "",
      link: "/staff/attendance",
    },
    {
      name: "Salary & Overtime",
      icon: "",
      link: "/staff/salary",
    },
    // {
    //     name:"Report",
    //     icon:"",
    //     link:"/faculty/report"
    // },
    {
      name: "Profile",
      icon: "",
      link: "/staff/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    redirect("/");
  };

  return (
    <nav className={`bg-white xl:flex xl:flex-col relative h-full overflow-hidden ${open ? "flex flex-col" : "hidden"} xl:w-[15vw] py-6 rounded-r-lg `}>
      <div className="flex items-center justify-between">
        <Image alt="logo" src={"/Header.jpg"} height={200} width={200} />
        <p
          onClick={() => setOpen(false)}
          className="pr-10 font-bold text-3xl cursor-pointer xl:hidden"
        >
          X
        </p>
      </div>

      <div className="">
        <ul className="relative px-2 xl:px-0 xl:pl-2">
          {lists.map((item, index) => (
            <li
              key={index}
              className={` text-lg my-5 py-2 pl-2 rounded-full  xl:rounded-none xl:rounded-l-full ${
                  pathname === item.link
                    ? "text-white bg-[#be6b66] w-full navbar"
                    : "text-black"
                }`}
            >
              <Link href={`${item.link}`}>{item.name}</Link>
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
    </nav>
  );
};

export default StaffNavbar;
