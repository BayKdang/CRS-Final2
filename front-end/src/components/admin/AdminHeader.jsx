import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminHeader = ({ adminName }) => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Welcome, {adminName}</h5>
          <p className="text-muted small mb-0">Admin Panel</p>
        </div>
        
        <div className="d-flex align-items-center">
          <div className="dropdown me-3">
            <button 
              className="btn btn-link text-dark position-relative p-0" 
              type="button" 
              id="notificationsDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notificationsDropdown" style={{ width: '300px' }}>
              <li><h6 className="dropdown-header">Notifications</h6></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2">
                      <i className="bi bi-car-front-fill"></i>
                    </div>
                  </div>
                  <div>
                    <span className="fw-bold">New booking</span>
                    <p className="text-muted small mb-0">John Doe booked Tesla Model S</p>
                    <small className="text-muted">10 minutes ago</small>
                  </div>
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-center small text-muted" href="#">
                  View all notifications
                </a>
              </li>
            </ul>
          </div>
          
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
              type="button" 
              id="userDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <img 
                src="https://ui-avatars.com/api/?name=Admin+User&background=random" 
                alt="" 
                width="32" 
                height="32" 
                className="rounded-circle me-2" 
              />
              <span className="d-none d-md-inline">{adminName}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
              <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Profile</a></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Sign out</button></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;