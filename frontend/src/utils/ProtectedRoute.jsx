import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipLoader } from 'react-spinners';

// Protected Route - Requires authentication
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

// Admin Route - Requires admin role
export const AdminRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not admin, redirect to home
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If admin, render the child routes
  return <Outlet />;
};

// Public Only Route - Redirects authenticated users
export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  // If authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  // If not authenticated, render the child routes
  return <Outlet />;
};