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
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const UserModal = ({ open, setOpen, type, user, refetch }) => {
  const isoTo24Hour = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fType = [
    {
      name: "Lecture Based",
      value: "LECTURE_BASED",
    },
    {
      name: "Salary Based",
      value: "SALARY_BASED",
    },
  ];

  const role = [
    {
      name: "Staff",
      value: "STAFF",
    },
    {
      name: "Faculty",
      value: "FACULTY",
    },
    {
      name: "Super Admin",
      value: "SUPER_ADMIN",
    },
  ];
  const [branch, setBranch] = useState([]);

  const [name, setName] = useState("");
  const [phoneNumber, setEmail] = useState("");
  const [roles, setRole] = useState("");
  const [branches, setBranches] = useState("");
  const [shiftInTime, setShiftInTime] = useState(null);
  const [shiftOutTime, setShiftOutTime] = useState(null);
  const [salary, setSalary] = useState(null);
  const [facultyType, setFacultyType] = useState(null);

  useEffect(() => {
    console.log(user);
    if (user?.name) {
      setName(user.name);
    }
    if (user?.phoneNumber) {
      setEmail(user.phoneNumber);
    }

    if (user?.role) {
      setRole(user.role);
    }
    if (user?.branch) {
      setBranches(user.branch.id);
    }
    if (user?.salary || user?.lectureRate) {
      setSalary(user.salary || user.lectureRate);
    }
    if (user?.shiftStartTime) {
      setShiftInTime(isoTo24Hour(user.shiftStartTime));
    }
    if (user?.shiftEndTime) {
      setShiftOutTime(isoTo24Hour(user.shiftEndTime));
    }
    if (user?.facultyType) {
      setFacultyType(user.facultyType);
    }
  }, [user]);

  useEffect(() => {
    const fetchBranch = async () => {
      let tok = JSON.parse(localStorage.getItem("user"));
      let token = tok.data.token;

      const { data } = await axios.get(`${mainRoute}/api/branch`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setBranch(data.data);
    };

    fetchBranch();
  }, []);

  const router = useRouter();

  const handleCreateUser = async () => {
    try {
      let tok = JSON.parse(localStorage.getItem("user"));
      let token = tok.data.token;

      const { data } = await axios.post(
        `${mainRoute}/api/auth/register`,
        {
          name,
          phoneNumber,
          role: roles,
          branchId: branches,
          shiftStartTime: shiftInTime,
          shiftEndTime: shiftOutTime,
          facultyType: facultyType,
          salary: salary,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("User Created Successfully");
      setOpen(false);
      // router.refresh();

      await refetch();
    } catch (err) {
      toast.error("Error in creating user");
      setOpen(false);
      router.refresh();
      await refetch();
    }
  };

  const handleEdit = async () => {
    try {
      let tokn = JSON.parse(localStorage.getItem("user"));
      let token = tokn.data.token;

      const { data } = await axios.put(
        `${mainRoute}/api/users/${user.id}`,
        {
          name,
          phoneNumber,
          role: roles,
          branchId: Number(branches),
          shiftStartTime: shiftInTime,
          shiftEndTime: shiftOutTime,
          salary: salary,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("User Updated Successfully");
      setOpen(false);
      // router.refresh();
      await refetch();
    } catch (err) {
      toast.error("Error in updating user");
      setOpen(false);
      // router.refresh();
      await refetch();
    }
  };

  const deleteUser = async () => {
    try {
      const id = user?.id;
      let tokn = JSON.parse(localStorage.getItem("user"));
      let token = tokn.data.token;

      const { data } = await axios.delete(`${mainRoute}/api/users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User Deactivated Successfully");
      setOpen(false);
      await refetch();
      // router.refresh();
    } catch (err) {
      toast.error("Error in deleting user");
      setOpen(false);
      await refetch();
      // router.refresh();
    }
  };
  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center">
          <div className="h-auto p-5 w-[80%] xl:w-[40vw]  bg-white shadow-2xl rounded-2xl  ">
            <div className="flex justify-end px-5">
              <span
                className="cursor-pointer font-bold"
                onClick={() => setOpen(false)}
              >
                x
              </span>
            </div>

            {type === "add" && (
              <div className="flex flex-col gap-5 [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div]:gap-2 ">
                <div className="">
                  <Label>Name:</Label>
                  <Input
                    onChange={(e) => setName(e.target.value)}
                    type={`text`}
                    placeholder={`Name`}
                  />
                </div>
                <div className="">
                  <Label>Phone Number:</Label>
                  <Input
                    maxLength={10}
                    onChange={(e) => setEmail(e.target.value)}
                    type={`text`}
                    inputMode={`numeric`}
                    placeholder={`Phone Number`}
                  />
                </div>

                <div className="flex flex-row! justify-around [&>div]:w-[50%] [&>div]:flex [&>div]:flex-col [&>div]:gap-2 ">
                  <div className="">
                    <Label>Role:</Label>
                    <Select onValueChange={(v) => setRole(v)}>
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Role`} />
                      </SelectTrigger>
                      <SelectContent>
                        {role.map((item, i) => (
                          <SelectItem key={i} value={item.value}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="">
                    <Label>Branch:</Label>
                    <Select
                      onValueChange={(v) => setBranches(v)}
                      className={`w-full`}
                    >
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Branch`} />
                      </SelectTrigger>
                      <SelectContent>
                        {branch.map((item, i) => (
                          <SelectItem key={i} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {roles === "FACULTY" && (
                  <div className="">
                    <Label>Faculty Type:</Label>
                    <Select
                      onValueChange={(v) => setFacultyType(v)}
                      className={`w-full`}
                    >
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Faculty Type`} />
                      </SelectTrigger>
                      <SelectContent>
                        {fType.map((item, i) => (
                          <SelectItem key={i} value={item.value}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="">
                  <Label>
                    Salary(
                    {`${
                      roles === "STAFF" || facultyType === "SALARY_BASED"
                        ? "Monthly"
                        : "Per Lecture"
                    }`}
                    ):
                  </Label>
                  <Input
                    onChange={(e) => setSalary(e.target.value)}
                    type={`number`}
                    placeholder={`Salary`}
                  />
                </div>

                {(roles === "STAFF" || facultyType === "SALARY_BASED") && (
                  <div className="flex  justify-around w-full [&>div]:w-[50%] [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
                    <Label>Shift Time</Label>
                    <div className="flex-row! w-full!">
                      <Input
                        type={`time`}
                        onChange={(e) => setShiftInTime(e.target.value)}
                      />
                      <Input
                        type={`time`}
                        onChange={(e) => setShiftOutTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="">
                  <Button
                    onClick={handleCreateUser}
                    className={`cursor-pointer`}
                  >
                    Add New User
                  </Button>
                </div>
              </div>
            )}

            {type === "edit" && (
              <div className="flex flex-col gap-5 [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div]:gap-2 ">
                <div className="">
                  <Label>Name:</Label>
                  <Input
                    type={`text`}
                    value={name}
                    placeholder={`Name`}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="">
                  <Label>Phone Number:</Label>
                  <Input
                    type={`text`}
                    value={phoneNumber}
                    placeholder={`Email`}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-row! justify-around [&>div]:w-[50%] [&>div]:flex [&>div]:flex-col [&>div]:gap-2 ">
                  <div className="">
                    <Label>Role:</Label>
                    <Select
                      value={user?.role}
                      onValueChange={(v) => setRole(v)}
                    >
                      <SelectTrigger className={`w-full`}>
                        <SelectValue
                          value={roles}
                          placeholder={user?.role || "Role"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {role.map((item, i) => (
                          <SelectItem key={i} value={item.value}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="">
                    <Label>Branch:</Label>
                    <Select
                      onValueChange={(v) => setBranches(v)}
                      className={`w-full`}
                      value={user?.branch.id}
                    >
                      <SelectTrigger className={`w-full`}>
                        <SelectValue placeholder={`Branch`} />
                      </SelectTrigger>
                      <SelectContent>
                        {branch.map((item, i) => (
                          <SelectItem key={i} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="">
                  <Label>
                    Salary(
                    {`${
                      roles === "STAFF" || facultyType === "SALARY_BASED"
                        ? "Monthly"
                        : "Per Lecture"
                    }`}
                    ):
                  </Label>
                  <Input
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    type={`number`}
                    placeholder={`Salary`}
                  />
                </div>

                {(roles === "STAFF" || facultyType === "SALARY_BASED") && (
                  <div className="flex  justify-around w-full [&>div]:w-[50%] [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
                    <Label>Shift Time</Label>
                    <div className="flex-row! w-full!">
                      <Input
                        type={`time`}
                        onChange={(e) => setShiftInTime(e.target.value)}
                        value={shiftInTime}
                      />
                      <Input
                        type={`time`}
                        onChange={(e) => setShiftOutTime(e.target.value)}
                        value={shiftOutTime}
                      />
                    </div>
                  </div>
                )}

                <div className="">
                  <Button onClick={handleEdit} className={`cursor-pointer`}>
                    Edit User
                  </Button>
                </div>
              </div>
            )}

            {type === "delete" && (
              <div className="h-full w-full flex flex-col justify-center px-10 gap-5 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 ">
                <p className="">
                  You Want To Deactivate{" "}
                  <span className="font-bold text-2xl text-red-600">
                    {name}
                  </span>{" "}
                </p>
                <Button
                  onClick={deleteUser}
                  variant="destructive"
                  className={`cursor-pointer`}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserModal;
