import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import axios from "axios";
import { mainRoute } from "@/components/apiroute";
import { Eye, EyeOff } from "lucide-react";

const ChangePass = ({ changepass, setChangePass, user }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePassword = async () => {
    try {
      setError("");

      if (!password) {
        setError("Please enter a new password");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      setLoading(true);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.data?.token;

      const { data } = await axios.put(
        `${mainRoute}/api/auth/update-password`,
        {
          userId: user.id,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setPassword("");
        setShowPassword(false);
        setChangePass(false);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!changepass) return null;

  return (
    <div className="h-screen w-full bg-white/40 absolute top-0 left-0 z-10 flex items-center justify-center">
      <div className="min-h-10 w-[50%] bg-white rounded-xl drop-shadow-2xl relative p-5">
        {/* Close */}
        <div
          className="absolute top-0 right-0 p-2 pr-10 cursor-pointer font-semibold"
          onClick={() => {
            setPassword("");
            setError("");
            setShowPassword(false);
            setChangePass(false);
          }}
        >
          x
        </div>

        <div className="pt-5">
          {/* User Details */}
          <ul className="space-y-2">
            <li>
              Name: <span className="font-semibold">{user?.name}</span>
            </li>

            <li>
              Phone No.:{" "}
              <span className="font-semibold">{user?.phoneNumber}</span>
            </li>

            <li>
              Role: <span className="font-semibold">{user?.role}</span>
            </li>
          </ul>

          {/* Password */}
          <div className="p-2 mt-5 flex flex-col gap-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 cursor-pointer"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button
              className="cursor-pointer"
              onClick={updatePassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePass;