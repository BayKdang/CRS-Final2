import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { apiUrl } from './http';
import Navbar from './Navbar';
import Footer from './Footer';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define fetchBookings outside useEffect so it can be used by the refresh button
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bookings with token:", user?.token);
      
      // Check if user is authenticated
      if (!user || !user.token) {
        console.error("User not authenticated or token missing");
        return;
      }
      
      const response = await fetch(`${apiUrl}/user/bookings`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      // Log the raw response for debugging
      console.log("Raw response:", response);
      
      const data = await response.json();
      console.log("Bookings API response:", data);
      
      // Handle different response formats
      if (data.data) {
        console.log("Setting bookings from data.data:", data.data);
        setBookings(data.data);
      } else if (data.bookings) {
        console.log("Setting bookings from data.bookings:", data.bookings);
        setBookings(data.bookings);
      } else if (Array.isArray(data)) {
        console.log("Setting bookings from array data:", data);
        setBookings(data);
      } else {
        console.error("Unexpected bookings response format:", data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Call fetchBookings when the component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }
    
    fetchBookings();
  }, [isAuthenticated, navigate]);  // Remove user from the dependency array to avoid infinite loops
  
  // Helper function for status badge
  const getStatusBadge = (status) => {
    let variant = 'secondary';
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'confirmed':
        variant = 'success';
        break;
      case 'cancelled':
        variant = 'danger';
        break;
      case 'completed':
        variant = 'info';
        break;
      default:
        variant = 'secondary';
    }
    return <span className={`badge bg-${variant}`}>{status}</span>;
  };
  
  // Helper function for payment status badge
  const getPaymentBadge = (status) => {
    let variant = 'secondary';
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'paid':
        variant = 'success';
        break;
      case 'refunded':
        variant = 'info';
        break;
      case 'failed':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <span className={`badge bg-${variant}`}>{status}</span>;
  };
  
  return (
    <>
      <Navbar />
      <div className="container py-5 mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Bookings</h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => fetchBookings()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </>
            )}
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center my-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <h4 className="mt-3">No Bookings Found</h4>
            <p className="text-muted">You don't have any bookings yet.</p>
            <Link to="/shop" className="btn btn-primary mt-2">Browse Cars</Link>
          </div>
        ) : (
          <div className="row">
            {bookings.map(booking => (
              <div className="col-12 mb-4" key={booking.id}>
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Booking #{booking.id}</h5>
                    <div>
                      {getStatusBadge(booking.status)}
                      {' '}
                      {getPaymentBadge(booking.payment_status)}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3 mb-md-0">
                        {booking.car?.image ? (
                          <img 
                            src={`${apiUrl.replace('/api', '')}/${booking.car.image}`}
                            alt={booking.car?.name} 
                            className="img-fluid rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=Car';
                            }}
                          />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{height: '150px'}}>
                            <i className="bi bi-car-front fs-1 text-secondary"></i>
                          </div>
                        )}
                      </div>
                      <div className="col-md-5">
                        <h5>{booking.car?.name || 'Car details unavailable'}</h5>
                        <p className="text-muted mb-2">
                          {booking.car?.brand?.name && `${booking.car.brand.name} • `}
                          {booking.car?.category?.name}
                        </p>
                        
                        <div className="mb-2">
                          <i className="bi bi-calendar3 me-2"></i>
                          <strong>Pickup:</strong> {new Date(booking.pickup_date).toLocaleDateString()}
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-calendar3-fill me-2"></i>
                          <strong>Return:</strong> {new Date(booking.return_date).toLocaleDateString()}
                        </div>
                        <div className="mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          <strong>Location:</strong> {booking.pickup_location}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light h-100">
                          <div className="card-body">
                            <h6 className="card-title">Booking Details</h6>
                            <div className="mb-2 d-flex justify-content-between">
                              <span>Subtotal:</span>
                              <span>${parseFloat(booking.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                              <span>Tax:</span>
                              <span>${parseFloat(booking.tax_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold">
                              <span>Total:</span>
                              <span>${parseFloat(booking.total_price || 0).toFixed(2)}</span>
                            </div>
                            
                            {booking.status === 'pending' && (
                              <div className="d-grid mt-3">
                                <Link 
                                  to={`/checkout/${booking.id}`} 
                                  className="btn btn-primary btn-sm"
                                >
                                  Complete Payment
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyBookings;