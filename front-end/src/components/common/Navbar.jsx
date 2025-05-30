import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useUserAuth();
  
  // Function to navigate to shop page
  const goToShop = () => {
    navigate('/shop');
  };

  const handleLogout = () => {
    logout();
    // You might want to redirect after logout
    navigate('/');
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        {/* Logo on the left */}
        <Link className="navbar-brand" to="/">Car Rental</Link>
        
        {/* Mobile toggle button */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Navbar content with centered links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* This div pushes the ul to the center */}
          <div className="me-auto"></div>
          
          {/* Centered navigation links */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#about">About</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shop">Cars</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#faq">FAQ</a>
            </li>
          </ul>
          
          {/* This div pushes the actions to the right */}
          <div className="ms-auto"></div>
          
          {/* Right-aligned action buttons */}
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light me-2" 
              onClick={goToShop}
            >
              <i className="bi bi-search"></i>
            </button>
            
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {user.name.split(' ')[0]}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/bookings">My Bookings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-primary me-2" 
                  data-bs-toggle="modal" 
                  data-bs-target="#loginModal"
                >
                  Login
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  data-bs-toggle="modal" 
                  data-bs-target="#registerModal"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;