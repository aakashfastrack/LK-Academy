"use client";

import { mainRoute } from "@/components/apiroute";
import axios from "axios";

const { createContext, useContext } = require("react");

const ManagementContext = createContext(null);

export const ManagementProvider = ({ children }) => {
  const fetchBranch = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/branch`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data.data);
    return data.data;
  };

  const fetchUser = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;

    const { data } = await axios.get(`${mainRoute}/api/users/allusers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  };

  const fetchSubject = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/subject`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  };

  const fetchLecture = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;

    const { data } = await axios.get(`${mainRoute}/api/lecture`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  };

  const changePassword = async (id, newPass, oldPass) => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.put(
      `${mainRoute}/api/auth/changepass/${id}`,
      { newPass, oldPass },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data.data;
  };

  const fetchCourse = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;

    const { data } = await axios.get(`${mainRoute}/api/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  };

  const fetchReport = async (branchIds, month, year) => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;

    const { data } = await axios.post(
      `${mainRoute}/api/report/generate?month=${month}&year=${year}`,
      {
        branchIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data.data;
  };

  return (
    <ManagementContext
      value={{
        fetchBranch,
        fetchUser,
        fetchSubject,
        fetchLecture,
        changePassword,
        fetchCourse,
        fetchReport,
      }}
    >
      {children}
    </ManagementContext>
  );
};

export const useManagement = () => {
  return useContext(ManagementContext);
};
