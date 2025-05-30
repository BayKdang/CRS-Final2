import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  
  const menuItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin/dashboard' },
    { label: 'Cars', icon: 'bi-car-front', path: '/admin/cars' },
    { label: 'Bookings', icon: 'bi-calendar-check', path: '/admin/bookings' },
    { label: 'Customers', icon: 'bi-people', path: '/admin/customers' },
    { label: 'Reports', icon: 'bi-bar-chart', path: '/admin/reports' },
    { label: 'Settings', icon: 'bi-gear', path: '/admin/settings' }
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
      <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <i className="bi bi-car-front fs-4 me-2"></i>
        <span className="fs-4">Car Rental</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item" key={index}>
            <Link 
              to={item.path} 
              className={`nav-link text-white ${location.pathname === item.path ? 'active' : ''}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <hr />
      <div className="dropdown">
        <a 
          href="#" 
          className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" 
          id="dropdownUser1" 
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
          <strong>Admin</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li><a className="dropdown-item" href="#">Profile</a></li>
          <li><a className="dropdown-item" href="#">Settings</a></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button className="dropdown-item" onClick={handleLogout}>Sign out</button></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;