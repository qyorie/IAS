import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal.jsx';
import RegisterModal from './RegisterModal.jsx';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';


const Navbar = () => {
  const { accessToken, role, setRole, setAccessToken } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // call backend to clear cookie
      console.log("Logged out successfully");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      window.location.href = "/"; // redirect to home
    }
  };

  return (
    <>
      <nav className="bg-gray-800 text-white">
        <div className="mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-between">
            {role === 'user' ? (
              <>
                <Link to="/"><img src="/logo.svg" alt="Company Logo"/></Link>
              </>
            ) : (
              <>
                <Link to="/"><img src="/logo.svg" alt="Company Logo"></img></Link>
              </>
            )}
            
            <div className="space-x-4">
              {role === 'admin' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/create" className="hover:text-blue-400">Create Post</Link>
                  <Link to="/manageposts" className="hover:text-blue-400">Manage Posts</Link>
                  <Link to="/manageusers" className="hover:text-blue-400">Manage Users</Link>
                </>
              )}
              { role === 'user' && (
                <>
                  <Link to="/" className="hover:text-blue-400">Home</Link>
                  <Link to="/create" className="hover:text-blue-400">Create Post</Link>
                  <Link to="/manageposts" className="hover:text-blue-400">Manage Posts</Link>
                </>
              )}

              {!accessToken && (
                <>
                  <button onClick={() => setShowLogin(true)} className="btn btn-primary hover:text-white">Login</button>
                  <button onClick={() => setShowRegister(true)} className="btn btn-secondary hover:text-blue-400">Sign Up</button>
                </>
              )}

              {accessToken && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
};

export default Navbar;
