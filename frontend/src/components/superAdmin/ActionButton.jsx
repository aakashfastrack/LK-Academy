"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { MoreVertical, TimerReset } from "lucide-react";

const ActionButton = ({
  user,
  edit = true,
  setOp,
  setUs,
  setType,
  needed,
  need,
  setReset,
}) => {
  const [open, setOpen] = useState(false);
  const handleEdit = (user) => {
    // alert(user.id)
  };

  const handleDelete = (user) => {
    setOp(true);
    setType("delete");
    setOpen(false);
    setUs(user);
  };
  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded hover:bg-gray-600`}
      >
        <MoreVertical size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-50">
          {needed && (
            <button
              onClick={() => {
                setOpen(false);
                setUs(user);
                setType("assign");
                setOp(true);
              }}
              className="flex w-full px-3 py-2 text-sm hover:bg-gray-100"
            >
              🔗 Assign
            </button>
          )}

          {edit && (
            <button
              onClick={() => {
                setOpen(false);
                handleEdit(user);
                setUs(user);
                setType("edit");
                setOp(true);
              }}
              className="flex w-full px-3 py-2 text-sm hover:bg-gray-100"
            >
              ✏️ Edit
            </button>
          )}

          {need && (
            <button
              onClick={() => {
                setOpen(false);
                handleEdit(user);
                setUs(user);
                setType("edit");
                setOp(true);
                setReset(true);
              }}
              className="flex w-full px-3 py-2 text-sm hover:bg-gray-100"
            >
              <TimerReset size={20} />
              Reset
            </button>
          )}

          <button
            onClick={() => {
              setOpen(false);
              handleDelete(user);
            }}
            className="flex w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButton;
