import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { admin, isLoading } = useAdminAuth();
  const location = useLocation();
  
  console.log('ProtectedAdminRoute - admin:', admin);
  console.log('ProtectedAdminRoute - isLoading:', isLoading);

  if (isLoading) {
    // Show loading spinner while checking auth status
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!admin) {
    // Redirect to login if not authenticated
    console.log('Redirecting to login from', location.pathname);
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  
  // If authenticated, render the children (protected content)
  console.log('User is authenticated, rendering protected content');
  return children;
};

export default ProtectedAdminRoute;