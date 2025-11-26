import React from 'react';
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await api.get(
          `/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );

        setUsers(res.data.data); // << list of users
        setLoading(false);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };

    fetchUsers();
  }, []);

  if (loading){
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    );
  } 

  return (
    <div className="min-h-screen mx-auto max-w-6xl p-4">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user._id} className="text-center">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                {user.isActive ? "Active" : "Banned"}
              </td>
              <td className="p-2 border space-x-2">
                <button className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded">
                  Ban
                </button>
                <button className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUser;
