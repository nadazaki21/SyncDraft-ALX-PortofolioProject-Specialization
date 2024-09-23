import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken');
  
  // If token doesn't exist, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If token exists, allow access to the protected page
  return children;
};

export default ProtectedRoute;
