import React from "react";

const Audit = ({ open, setOpen, logs }) => {
  return (
    <>
      {open && (
        <div className="absolute z-10 top-0 left-0 flex items-center justify-center bg-black/50 h-full w-full">
          <div className="p-2 bg-white rounded-xl shadow-xl w-[90%] lg:w-[60%] min-h-1/2 max-h-[80vh]  py-2  overflow-hidden">
            <div
              className="items-end static top-0 bg-white justify-end flex cursor-pointer px-5 py-3"
              onClick={() => setOpen(false)}
            >
              X
            </div>
            <table className="w-full overflow-auto">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>

                    <td>{log.user?.name}</td>

                    <td>
                      <span className="bg-blue-100 text-blue-700 px-2 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td>{log.entity}</td>

                    <td className="text-wrap">{log.description}</td>

                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Audit;
