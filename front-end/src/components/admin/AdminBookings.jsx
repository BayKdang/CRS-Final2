import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminBookings = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    from_date: '',
    to_date: ''
  });
  
  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.from_date) queryParams.append('from_date', filters.from_date);
        if (filters.to_date) queryParams.append('to_date', filters.to_date);
        
        const url = `http://localhost:8000/api/admin/bookings?${queryParams.toString()}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        setBookings(data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Error loading bookings');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (admin?.token) {
      fetchBookings();
    }
  }, [admin, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: ''
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'confirmed': 
        return 'info';
      case 'active': 
        return 'primary';
      case 'completed': 
        return 'success';
      case 'cancelled': 
        return 'danger';
      case 'pending':
      default: 
        return 'warning';
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
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
            <h1 className="h3 mb-0">Booking Management</h1>
            <div>
              <button 
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => {/* TODO: Add export functionality */}}
              >
                <i className="bi bi-file-earmark-text me-1"></i> Export List
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Filters</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select" 
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">From Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    name="from_date"
                    value={filters.from_date}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">To Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    name="to_date"
                    value={filters.to_date}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className="btn btn-secondary"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bookings table */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Car</th>
                      <th>Pickup Date</th>
                      <th>Return Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? (
                      bookings.map(booking => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>
                            <div>{booking.customer_name}</div>
                            <small className="text-muted">{booking.customer_email}</small>
                          </td>
                          <td>
                            {booking.car ? (
                              <>
                                <div>{booking.car.name}</div>
                                <small className="text-muted">
                                  {booking.car.brand?.name} {booking.car.category?.name}
                                </small>
                              </>
                            ) : 'N/A'}
                          </td>
                          <td>{formatDate(booking.pickup_date)}</td>
                          <td>{formatDate(booking.return_date)}</td>
                          <td>{formatCurrency(booking.total_price)}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${booking.payment_status === 'paid' ? 'success' : 'warning'}`}>
                              {booking.payment_status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-1"
                              onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No bookings found. Adjust filters or add new bookings.
                        </td>
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

export default AdminBookings;