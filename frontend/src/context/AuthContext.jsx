import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken') || null
  );

  useEffect(() => {
    if (accessToken) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  // ------------------------
  // Check authentication
  // ------------------------
  const checkAuth = async () => {
    if (!accessToken) {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      return;
    }

    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const userData = response.data.user || response.data.data;
      setUser(userData);

      // If backend returns role
      if (userData?.role) setRole(userData.role);

      setIsAuthenticated(true);

    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // LOGIN
  // ------------------------
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.accessToken;
      if (!token) return { success: false, error: "No token received" };

      // Save token
      localStorage.setItem("accessToken", token);
      setAccessToken(token);

      // Decode token → get role
      const decoded = jwtDecode(token);
      setRole(decoded.role || null);

      await checkAuth();
      return { success: true };

    } catch (error) {
      console.error("Login failed:", error);
      return { 
        success: false,
        error: error.response?.data?.message || "Login failed"
      };
    }
  };

  // ------------------------
  // REGISTER
  // ------------------------
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const token = res.data.accessToken || res.data.token;

      if (!token) return { success: false, error: "No token received" };

      localStorage.setItem("accessToken", token);
      setAccessToken(token);

      await checkAuth();
      return { success: true };

    } catch (error) {
      console.error("Register failed:", error);
      return { 
        success: false,
        error: error.response?.data?.message || "Registration failed"
      };
    }
  };

  // ------------------------
  // LOGOUT
  // ------------------------
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        accessToken,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        setRole,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
