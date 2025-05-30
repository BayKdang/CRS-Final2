import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const Dashboard = () => {
  const { admin, isAuthenticated, isLoading } = useAdminAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    todayBookings: 0,
    thisMonthRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Fetch booking stats
        const statsResponse = await fetch('http://localhost:8000/api/admin/booking-stats', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch booking stats');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData.data);
        
        // Fetch recent bookings
        const bookingsResponse = await fetch('http://localhost:8000/api/admin/bookings?limit=5', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch recent bookings');
        }
        
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData.data.slice(0, 5)); // Take first 5 results
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    if (admin?.token) {
      fetchStats();
    }
  }, [admin]);
  
  // Convert stats for display
  const displayStats = [
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: 'bi-calendar-date', 
      color: 'primary' 
    },
    { 
      title: 'Active Rentals', 
      value: stats.activeBookings, 
      icon: 'bi-car-front', 
      color: 'success' 
    },
    { 
      title: 'Today\'s Bookings', 
      value: stats.todayBookings, 
      icon: 'bi-calendar-check', 
      color: 'info' 
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${parseFloat(stats.thisMonthRevenue).toLocaleString()}`, 
      icon: 'bi-currency-dollar', 
      color: 'warning' 
    }
  ];
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'confirmed': return 'info';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending':
      default: return 'warning';
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading || isLoadingStats) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      
      <div className="flex-grow-1">
        <AdminHeader adminName={admin?.name || 'Admin'} />
        
        <div className="container-fluid py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Dashboard</h1>
            <div>
              <Link to="/admin/bookings" className="btn btn-sm btn-primary">
                <i className="bi bi-calendar-check me-1"></i> Manage Bookings
              </Link>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="row g-4 mb-4">
            {displayStats.map((stat, index) => (
              <div className="col-md-6 col-xl-3" key={index}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body d-flex align-items-center">
                    <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                      <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">{stat.value}</h5>
                      <p className="card-text text-muted small mb-0">{stat.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent bookings */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Bookings</h5>
                <Link to="/admin/bookings" className="btn btn-sm btn-link text-decoration-none">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Car</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>{booking.customer_name}</td>
                          <td>{booking.car?.name || 'N/A'}</td>
                          <td>{formatDate(booking.created_at)}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/admin/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary me-1">
                              <i className="bi bi-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">No recent bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;