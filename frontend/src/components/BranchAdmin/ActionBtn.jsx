"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { MoreVertical, TimerReset } from "lucide-react";

const ActionBtn = ({ op, setOp, type, setType, lecu, setlecture,need,setReset }) => {
  const [open, setOpen] = useState(false);
  

  const handleEdit = () => {
    setlecture(lecu);
    setOp(true);
    setType("edit");
    setOpen(false);
    setReset(false)
  };

  const handleDelete = () => {
    setlecture(lecu);
    setOp(true);
    setType("delete");
    setOpen(false);
  };
  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setOpen(!open)}
          className={`p-2 rounded hover:bg-gray-600`}
        >
          <MoreVertical size={16} />
        </Button>

        {open && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-50 [&>Button]:cursor-pointer ">
            <Button
              className={`flex w-full px-3 py-2 text-sm  rounded-none bg-white hover:text-gray-500 text-gray-700 hover:bg-gray-100`}
              onClick={handleEdit}
            >
              ✏️ Edit
            </Button>

            {need && (
              <button
                onClick={() => {
                  setOpen(false);
                  handleEdit();
                  // setUs(user);
                  setType("edit");
                  setOp(true);
                  setReset(true);
                }}
                className="flex justify-center items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
              >
                <TimerReset size={20} />
                Reset
              </button>
            )}

            <Button
              onClick={handleDelete}
              variant="destructive"
              className={`flex w-full px-3 py-2 text-sm rounded-none hover:bg-red-700  `}
            >
              🗑️ Delete
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ActionBtn;
