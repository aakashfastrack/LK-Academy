import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useManagement } from "@/context/ManagementContext";
import React, { useEffect, useState } from "react";

const RepModal = ({ open, setOpen }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [branches, setBranches] = useState([]);
  const [branchIds, setBranchIds] = useState([]);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchBranch, fetchReport } = useManagement();

  useEffect(() => {
    const fetchBranches = async () => {
      const branchdata = await fetchBranch();
      setBranches(branchdata);
    };

    if (open) {
      fetchBranches();
    }
  }, [open]);

  useEffect(() => {
    const loadReport = async () => {
      const reportdata = await fetchReport(branchIds, month, year);
      setReportData(reportdata);
    };
    if (open) loadReport();
  }, [open, year, month, branchIds, branches]);

  const handleBranchSelection = (branchId) => {
    setBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-3"
          onClick={(e) => {
            setOpen(false);
          }}
        >
          <div
            className="w-full sm:w-[95%] md:w-[90%] lg:w-[80%] xl:w-[70%] max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b p-5">
              <h1 className="text-lg md:text-2xl font-bold">Monthly Report</h1>

              <Button size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
                <div>
                  <label className="font-semibold">Month</label>

                  <select
                    className="border rounded p-2 w-full"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold">Year</label>

                  <Input
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="font-semibold">Branches</label>
                  <div className="border rounded p-3 max-h-52 overflow-y-auto">
                    {branches.map((branch) => (
                      <label
                        key={branch.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={branchIds.includes(branch.id)}
                          onChange={() => handleBranchSelection(branch.id)}
                        />

                        {branch.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Total Faculty</h2>
                  <p className="text-xl md:text-2xl font-bold">
                    {reportData?.summary?.totalFaculty}
                  </p>
                </div>

                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Total Staff</h2>
                  <p className="text-xl md:text-2xl font-bold">
                    {reportData?.summary?.totalStaff}
                  </p>
                </div>

                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Total Lectures</h2>
                  <p className="text-xl md:text-2xl font-bold">
                    {reportData?.summary?.totalLectures}
                  </p>
                </div>

                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Total Salary Paid</h2>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    ₹{reportData?.summary?.totalSalaryPaid}
                  </p>
                </div>

                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Total Penalty</h2>
                  <p className="text-xl md:text-2xl font-bold text-red-600">
                    ₹{reportData?.summary?.totalPenalty}
                  </p>
                </div>

                <div className="border rounded-xl p-4 shadow bg-white">
                  <h2 className="text-gray-500 text-sm">Overtime Pay</h2>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    ₹{reportData?.summary?.totalOvertimePay}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h1 className="text-xl font-bold mb-4">
                  Branch Wise Breakdown
                </h1>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-175 w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Branch</th>
                        <th className="border p-2">Faculty</th>
                        <th className="border p-2">Staff</th>
                        <th className="border p-2">Lectures</th>
                        <th className="border p-2">Salary Paid</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData?.branchWiseBreakdown?.map((branch) => (
                        <tr key={branch.branchId}>
                          <td className="border p-2">{branch.branchName}</td>

                          <td className="border p-2">{branch.totalFaculty}</td>

                          <td className="border p-2">{branch.totalStaff}</td>

                          <td className="border p-2">{branch.totalLectures}</td>

                          <td className="border p-2">
                            ₹{branch.totalSalaryPaid}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepModal;
