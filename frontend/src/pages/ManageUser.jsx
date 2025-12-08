import React from 'react';
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios.js";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

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
        // Filter out admin users
        const nonAdminUsers = res.data.data.filter(user => user.role !== 'admin');
        setUsers(nonAdminUsers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleBan = async (userId) => {
    try {
      const csrf = await api.get('/csrf-token');
      await api.patch(
        `/admin/users/${userId}/ban`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            'X-CSRF-Token': csrf.data.csrfToken
          },
          withCredentials: true
        }
      );

      // Update user status locally
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      ));
    }catch (error) {
      console.error("Failed to ban user", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
      const csrf = await api.get('/csrf-token');
      await api.delete(
        `/admin/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            'X-CSRF-Token': csrf.data.csrfToken
          },
          withCredentials: true
        }
      );

      // Remove user locally
      setUsers(users.filter(user => user._id !== userId
      ));
    }catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  if (loading){
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className='mx-auto max-w-6xl p-4 '>
        <h2 className="text-xl font-bold mb-4">Manage Users</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-900">
              <th className="p-2 border-black-500">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {users.map(user => (
              <tr key={user._id} className="text-center">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">
                  {user.isActive ? "Active" : "Banned"}
                </td>
                <td className="p-2 border space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded"
                    onClick={() => handleBan(user._id)}
                  >
                    Ban
                  </button>
                  <button className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUser;