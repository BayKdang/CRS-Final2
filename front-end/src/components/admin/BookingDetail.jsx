import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`http://localhost:8000/api/admin/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBooking(data.data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Error loading booking details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (admin?.token) {
      fetchBookingDetails();
    }
  }, [id, admin]);
  
  // Update booking status
  const updateStatus = async (newStatus, reason = '') => {
    try {
      setIsProcessing(true);
      
      const response = await fetch(`http://localhost:8000/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      const data = await response.json();
      setBooking(data.data);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error updating booking status');
    } finally {
      setIsProcessing(false);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate rental duration
  const calculateDuration = () => {
    if (!booking) return 0;
    
    const start = new Date(booking.pickup_date);
    const end = new Date(booking.return_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Include both start and end days
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
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="d-flex">
        <AdminSidebar />
        <div className="flex-grow-1">
          <AdminHeader adminName={admin?.name || 'Admin'} />
          <div className="container-fluid py-4 px-4">
            <div className="alert alert-danger">
              <h4>Error</h4>
              <p>Booking not found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate('/admin/bookings')}
              >
                Back to Bookings
              </button>
            </div>
          </div>
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
            <h1 className="h3 mb-0">Booking Details #{booking.id}</h1>
            <div>
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate('/admin/bookings')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Bookings
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i>
                Print Details
              </button>
            </div>
          </div>
          
          {/* Status and Actions */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Current Status</h5>
                  <div className="d-flex align-items-center">
                    <span className={`badge bg-${getStatusBadgeColor(booking.status)} fs-6 me-3`}>
                      {booking.status.toUpperCase()}
                    </span>
                    <span className={`badge bg-${booking.payment_status === 'paid' ? 'success' : 'warning'} fs-6`}>
                      {booking.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h5>Update Status</h5>
                  <div className="btn-group" role="group">
                    {booking.status !== 'confirmed' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-info"
                        onClick={() => updateStatus('confirmed')}
                        disabled={isProcessing}
                      >
                        Confirm
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={() => updateStatus('active')}
                        disabled={isProcessing}
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    
                    {booking.status === 'active' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-success"
                        onClick={() => updateStatus('completed')}
                        disabled={isProcessing}
                      >
                        Complete
                      </button>
                    )}
                    
                    {!['completed', 'cancelled'].includes(booking.status) && (
                      <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={() => {
                          const reason = prompt('Enter cancellation reason:');
                          if (reason !== null) {
                            updateStatus('cancelled', reason);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            {/* Booking Information */}
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Booking Information</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Customer Details</h6>
                      <p className="mb-1"><strong>Name:</strong> {booking.customer_name}</p>
                      <p className="mb-1"><strong>Email:</strong> {booking.customer_email}</p>
                      <p className="mb-1"><strong>Phone:</strong> {booking.customer_phone}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Booking Dates</h6>
                      <p className="mb-1"><strong>Pickup:</strong> {formatDate(booking.pickup_date)}</p>
                      <p className="mb-1"><strong>Return:</strong> {formatDate(booking.return_date)}</p>
                      <p className="mb-1"><strong>Duration:</strong> {calculateDuration()} days</p>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Locations</h6>
                      <p className="mb-1"><strong>Pickup:</strong> {booking.pickup_location}</p>
                      <p className="mb-1"><strong>Return:</strong> {booking.return_location}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Timestamps</h6>
                      <p className="mb-1"><strong>Created:</strong> {formatDate(booking.created_at)}</p>
                      {booking.confirmed_at && (
                        <p className="mb-1"><strong>Confirmed:</strong> {formatDate(booking.confirmed_at)}</p>
                      )}
                      {booking.pickup_at && (
                        <p className="mb-1"><strong>Picked Up:</strong> {formatDate(booking.pickup_at)}</p>
                      )}
                      {booking.returned_at && (
                        <p className="mb-1"><strong>Returned:</strong> {formatDate(booking.returned_at)}</p>
                      )}
                      {booking.cancelled_at && (
                        <p className="mb-1"><strong>Cancelled:</strong> {formatDate(booking.cancelled_at)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <h6 className="text-muted mb-2">Additional Notes</h6>
                      <p className="mb-1">{booking.notes || 'No additional notes'}</p>
                    </div>
                  </div>
                  
                  {booking.cancellation_reason && (
                    <div className="alert alert-danger mt-3">
                      <h6>Cancellation Reason:</h6>
                      <p className="mb-0">{booking.cancellation_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Car Details and Payment Summary */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Car Details</h5>
                </div>
                <div className="card-body">
                  {booking.car ? (
                    <>
                      <div className="text-center mb-3">
                        {booking.car.image && (
                          <img 
                            src={`http://localhost:8000/${booking.car.image}`} 
                            alt={booking.car.name}
                            className="img-fluid rounded mb-3"
                            style={{ maxHeight: "150px" }}
                          />
                        )}
                        <h5>{booking.car.name}</h5>
                        <p className="text-muted">
                          {booking.car.brand?.name} {booking.car.category?.name}
                        </p>
                      </div>
                      <div className="row mb-2">
                        <div className="col-6">
                          <p className="mb-0 text-muted">Year</p>
                          <strong>{booking.car.year}</strong>
                        </div>
                        <div className="col-6">
                          <p className="mb-0 text-muted">Daily Rate</p>
                          <strong>{formatCurrency(booking.car.price)}</strong>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-6">
                          <p className="mb-0 text-muted">Transmission</p>
                          <strong>{booking.car.transmission || 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <p className="mb-0 text-muted">Fuel Type</p>
                          <strong>{booking.car.fuel_type || 'N/A'}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-warning">Car details not available</div>
                  )}
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Payment Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(booking.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>{formatCurrency(booking.tax_amount)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(booking.total_price)}</span>
                  </div>
                  
                  <div className="alert alert-secondary mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Payment Status:</span>
                      <span className={`badge bg-${booking.payment_status === 'paid' ? 'success' : 'warning'}`}>
                        {booking.payment_status.toUpperCase()}
                      </span>
                    </div>
                    {booking.payment_status !== 'paid' && (
                      <button 
                        className="btn btn-success btn-sm w-100 mt-2"
                        onClick={async () => {
                          try {
                            setIsProcessing(true);
                            const response = await fetch(`http://localhost:8000/api/admin/bookings/${id}/status`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${admin.token}`
                              },
                              body: JSON.stringify({
                                payment_status: 'paid'
                              })
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to update payment status');
                            }
                            
                            const data = await response.json();
                            setBooking(data.data);
                            toast.success('Payment marked as paid');
                          } catch (error) {
                            toast.error('Error updating payment status');
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Status History</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>From Status</th>
                        <th>To Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.statusHistory.map(history => (
                        <tr key={history.id}>
                          <td>{formatDate(history.created_at)}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(history.old_status)}`}>
                              {history.old_status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(history.new_status)}`}>
                              {history.new_status.toUpperCase()}
                            </span>
                          </td>
                          <td>{history.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;