import { Button } from "@/components/ui/button";
import React from "react";

const DeleteModal = ({ open, setOpen, handleDelete,id }) => {
  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center">
          <div className="p-2 bg-white shadow-xs rounded min-w-[50%] h-[15vh] flex flex-col justify-around">
            <h1 className="text-center text-2xl uppercase font-semibold">
              Confirm lecture Delete?
            </h1>
            <div className="flex items-center justify-center gap-10">
              <Button className={`cursor-pointer`} variant="destructive" onClick={()=>handleDelete(id)}>
                Delete
              </Button>
              <Button className={`cursor-pointer`} variant="" onClick={()=>setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteModal;
