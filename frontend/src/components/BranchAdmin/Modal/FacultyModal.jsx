"use client";
import { mainRoute } from "@/components/apiroute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagement } from "@/context/ManagementContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const FacultyModal = ({ open, setOpen }) => {
  const router = useRouter();
  const { fetchBranch, fetchUser, fetchSubject, fetchLecture, fetchCourse } =
    useManagement();

  const [batch, setBatch] = useState([]);
  const [courses, setCourses] = useState([]);
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState(null);
  const [payout, setPayout] = useState(0);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [branchs, setBranch] = useState({});
  const [branchid, setBranchId] = useState(null);
  const [users, setUser] = useState([]);
  const [subject, setSubject] = useState([]);
  const [facultyId, setFacultyId] = useState({});
  const [subjectId, setSubjectId] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [actualIn, setActualIn] = useState(null);
  const [actualOut, setActualOut] = useState(null);
  const [facultyType, setFacultyType] = useState(null);
  const [course, setCourse] = useState(null);

  const formatTime = (isoTime) => {
    if (!isoTime) return "";
    const date = new Date(isoTime.replace("Z", ""));
    return new Date(isoTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const data = JSON.parse(localStorage.getItem("user"));
      const id = data.data.user.branchId;
      setBranch(data.data.user.branch);
      setBranchId(data.data.user.branchId);
      const user = await fetchUser();
      const filteruser = user
        .filter((user) => user.branchId === id)
        .filter((user) => user.role === "FACULTY")
        .filter((user) => user.isActive === true);
      setUser(filteruser);
    };

    loadData();
  }, []);

  const fetchBatch = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/batch`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const filtereddata = data.data.filter(
      (batch) => batch.course.branchId === branchid,
    );
    // console.log(filtereddata);
    setBatch(filtereddata);
  };
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCourse();
      setCourses(data);
    };
    loadData();
  }, [branchid]);

  useEffect(() => {
    fetchBatch();
  }, [course]);

  useEffect(() => {
    const loadData = async () => {
      const lecturedata = await fetchLecture();
      console.log(lecturedata);

      const filterlecture = lecturedata
        .filter((lec) => lec.faculty.id === Number(facultyId.id))
        .filter((lec) => lec.batchId === selectedBatch);

      // selectedBatch
      console.log(filterlecture);

      setSubject(filterlecture);
    };
    setFacultyType(facultyId.facultyType);

    loadData();
  }, [facultyId, selectedBatch]);

  const [lect, setLect] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const findplanned = subject.find(
        (item) => item.subjectId === subjectId.subject.id,
      );
      console.log(findplanned);
      setLect(findplanned);
      setStartTime(findplanned?.startTime);
      setEndTime(findplanned?.endTime);
    };
    loadData();
  }, [subjectId]);

  const FIFTEEN_MIN = 15 * 60 * 1000;

  useEffect(() => {
    if (facultyType === "SALARY_BASED") {
      setStartTime(facultyId.shiftStartTime);
      setEndTime(facultyId.shiftEndTime);
    }
  }, [facultyType]);

  const [cancelled, setCancelled] = useState(false);

  const [penaltyPreview, setPenaltyPreview] = useState(null);

  const lectureAmount = 500;

  function applyStatusOnPayout(calculatedPayout, status) {
    if (status === "MISSED") return 0;
    if (status === "CANCELLED") return calculatedPayout / 2;
    return calculatedPayout; // CONDUCTED
  }

  const LECTURE_MINUTES = 120;

  function calculateLectureBasedFaculty({
    plannedStart,
    plannedEnd,
    actualStart,
    actualEnd,
    lectureRate,
  }) {
    const FIFTEEN_MIN = 15 * 60 * 1000;

    let isLate = actualStart - plannedStart > FIFTEEN_MIN;
    let isEarly = plannedEnd - actualEnd > FIFTEEN_MIN;

    let penalty = "NONE";
    if (isLate && isEarly) penalty = "BOTH";
    else if (isLate) penalty = "LATE_START";
    else if (isEarly) penalty = "EARLY_END";

    const workedMinutes = Math.max(
      0,
      Math.floor((actualEnd - actualStart) / (1000 * 60)),
    );

    const lectureEquivalent = workedMinutes / LECTURE_MINUTES;
    console.log(lectureEquivalent);

    const calculatedPayout =
      lectureEquivalent > 1
        ? Number((lectureEquivalent * lectureRate).toFixed(2))
        : lectureRate;

    return {
      penalty,
      workedMinutes,
      lectureEquivalent: Number(lectureEquivalent.toFixed(2)),
      calculatedPayout,
      message:
        penalty === "NONE"
          ? "On Time"
          : penalty === "LATE_START"
            ? "Late Start"
            : penalty === "EARLY_END"
              ? "Early End"
              : "Late + Early",
    };
  }

  useEffect(() => {
    if (
      !subjectId.startTime ||
      !subjectId.endTime ||
      !actualIn ||
      !actualOut ||
      !status
    )
      return;

    const date = subjectId.startTime.split("T")[0];
    console.log(subjectId);

    const result = calculateLectureBasedFaculty({
      plannedStart: new Date(subjectId.startTime),
      plannedEnd: new Date(subjectId.endTime),
      actualStart: new Date(`${date}T${actualIn}`),
      actualEnd: new Date(`${date}T${actualOut}`),
      lectureRate: facultyId.lectureRate,
    });

    const finalPayout = applyStatusOnPayout(result.calculatedPayout, status);

    console.log(result);
    setPenaltyPreview(result);
    setPayout(finalPayout);
  }, [subjectId, actualIn, actualOut, status]);

  const settingpayout = async () => {
    const userdata = await fetchUser();

    const filterdata = userdata.find((user) => user.id === facultyId.id);

    if (status === "CONDUCTED") {
      setPayout(filterdata.salary);
    }
    if (status === "CANCELLED") {
      setPayout(filterdata.salary / 2);
    }
    if (status === "MISSED") {
      setPayout(0);
    }
  };

  useEffect(() => {
    // settingpayout();
  }, [status]);

  const markAttendance = async () => {
    try {
      let tokn = JSON.parse(localStorage.getItem("user"));
      let token = tokn.data.token;
      let today = new Date().toISOString().split("T")[0];
      const { data } = await axios.post(
        `${mainRoute}/api/attendance/lecture/attendance`,
        {
          lectureId: lect.id,
          actualStartTime: `${today}T${actualIn}`,
          actualEndTime: `${today}T${actualOut}`,
          status: status,
          payout: payout,
          date: date,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Attendance Marked Successfully");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("Error in marking attendance");
      setOpen(false);
      router.refresh();
    }
  };

  const markSalaryBasedAttendance = async () => {
    try {
      let tok = JSON.parse(localStorage.getItem("user")).data.token;
      let today = new Date();

      const { data } = axios.post(
        `${mainRoute}/api/attendance/faculty/attendance/mark`,
        {
          facultyId: facultyId.id,
          date: date,
          inTime: `${today}T${actualIn}`,
          outTime: `${today}T${actualOut}`,
          isLeave: status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tok}`,
          },
        },
      );

      toast.success("Attendance Marked Successfully");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("Error in marking attendance");
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center ">
          <div className="h-[80vh] p-5 w-[90%] xl:w-[40vw] bg-white shadow-2xl rounded-2xl overflow-hidden ">
            <div className="flex justify-end px-5">
              <span
                className="cursor-pointer font-bold"
                onClick={() => setOpen(false)}
              >
                x
              </span>
            </div>

            <div>
              <h1 className="text-xl font-semibold mb-2">Faculty Attendance</h1>
            </div>

            <div className="flex h-[90%] flex-col gap-5 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 overflow-y-auto overflow-x-hidden">
              <div>
                <Label>Date</Label>
                <Input
                  value={date}
                  type={`date`}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Branch</Label>
                <Input type={`text`} value={branchs.name} readOnly />
              </div>

              <div className="">
                <Label>Faculty Name</Label>
                <Select onValueChange={(v) => setFacultyId(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Faculty Name`} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((item, i) => (
                      <SelectItem key={i} value={item}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {facultyType === "LECTURE_BASED" && (
                <>
                  <div>
                    <Label>Course</Label>
                    <Select onValueChange={(v) => setCourse(v)}>
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Course`} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((item, i) => (
                          <SelectItem key={i} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="">
                    <Label>Batch</Label>
                    <Select onValueChange={(v) => setSelectedBatch(v)}>
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Batch`} />
                      </SelectTrigger>
                      <SelectContent>
                        {batch.map((item, i) => (
                          <SelectItem key={i} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <Select onValueChange={(v) => setSubjectId(v)}>
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Subject`} />
                      </SelectTrigger>
                      <SelectContent>
                        {subject.map((item, i) => (
                          <SelectItem value={item} key={i}>
                            {item.subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Status`} />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyType === "LECTURE_BASED" ? (
                      <SelectContent>
                        <SelectItem value={`CONDUCTED`}>Conducted</SelectItem>
                        <SelectItem value={`CANCELLED`}>Cancelled</SelectItem>
                        <SelectItem value={`MISSED`}>Missed</SelectItem>
                      </SelectContent>
                    ) : (
                      <SelectContent>
                        <SelectItem value={false}>Present</SelectItem>
                        <SelectItem value={true}>On Leave</SelectItem>
                      </SelectContent>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(status === "CONDUCTED" || facultyType === "SALARY_BASED") && (
                <>
                  <div>
                    <Label>Planned Time</Label>
                    {/* <input type="time" value="10:30" readOnly />  */}
                    <Input
                      type={`text`}
                      value={`${formatTime(startTime)} - ${formatTime(
                        endTime,
                      )}`}
                      readOnly
                    />
                  </div>

                  <div>
                    <div>
                      <Label>In Time</Label>
                      <Input
                        type={`time`}
                        onChange={(e) => setActualIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Out Time</Label>
                      <Input
                        type={`time`}
                        onChange={(e) => setActualOut(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {facultyType === "LECTURE_BASED" && (
                <>
                  <div>
                    <Label>Payout</Label>
                    <Input
                      value={payout}
                      readOnly
                      placeholder={`Payout`}
                      onChange={(e) => setPayout(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Penalty</Label>
                    <Input
                      type={`text`}
                      placeholder={`Penalty`}
                      readOnly
                      value={penaltyPreview?.message || "0"}
                    />
                  </div>
                </>
              )}

              <div className="flex-row! w-full [&>Button]:cursor-pointer">
                <Button
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={`w-1/2`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    facultyId.facultyType === "LECTURE_BASED"
                      ? markAttendance
                      : markSalaryBasedAttendance
                  }
                  className={`w-1/2`}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyModal;
