import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protected Route Guard
export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    if (user.role === 'SuperAdmin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'Cashier') {
      return <Navigate to="/pos" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children routes
  return <Outlet />;
};

// Public Route Guard (prevents logged in users from seeing Login/Signup)
export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    if (user.role === 'SuperAdmin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'Cashier') {
      return <Navigate to="/pos" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
