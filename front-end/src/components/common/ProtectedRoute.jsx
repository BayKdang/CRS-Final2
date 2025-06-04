import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext'; // Change this to match your Navbar

/**
 * A wrapper component that redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  // Use the same auth context as your Navbar
  const { isAuthenticated, isLoading, user } = useUserAuth(); 
  const location = useLocation();
  
  console.log('ProtectedRoute - auth state:', { isAuthenticated, isLoading, hasUser: !!user });

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
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to home');
    
    // Redirect to home page - NOT /login - since you use modals for login
    return <Navigate to="/" state={{ showLoginModal: true }} replace />;
  }
  
  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;