import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAdminBookingById, updateBookingStatus } from '../../services/adminBookingService';

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
        const result = await getAdminBookingById(id, admin.token);
        setBooking(result.data);
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
  const handleUpdateStatus = async (newStatus, reason = '') => {
    try {
      setIsProcessing(true);
      
      const result = await updateBookingStatus(id, {
        status: newStatus,
        reason: reason
      }, admin.token);
      
      setBooking(result.data);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error updating booking status');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Update payment status
  const handleUpdatePaymentStatus = async (newPaymentStatus) => {
    try {
      setIsProcessing(true);
      
      const result = await updateBookingStatus(id, {
        payment_status: newPaymentStatus
      }, admin.token);
      
      setBooking(result.data);
      toast.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
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

  const getCarStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return 'success';
      case 'reserved': return 'info';
      case 'rented': return 'primary';
      case 'maintenance': return 'warning';
      default: return 'secondary';
    }
  };
  
  // Add this function to your BookingDetail component
  const printBookingReceipt = () => {
    try {
      if (!booking) {
        toast.error('Booking information not available');
        return;
      }
      
      const car = booking.car || {};
      const currentDate = new Date().toLocaleDateString();
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate receipt content with more compact layout
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt #${booking.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 15px;
                color: #333;
                font-size: 12px;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 15px;
              }
              .header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
              }
              .header h1 {
                margin: 0 0 5px 0;
                font-size: 20px;
              }
              .header p {
                margin: 2px 0;
                font-size: 12px;
              }
              .title {
                text-align: center;
                margin-bottom: 15px;
              }
              .title h2 {
                margin: 0 0 5px 0;
                font-size: 16px;
              }
              h1, h2, h3 {
                color: #444;
              }
              .section {
                margin-bottom: 12px;
              }
              .section h3 {
                border-bottom: 1px solid #ddd;
                padding-bottom: 4px;
                margin: 0 0 8px 0;
                font-size: 14px;
              }
              .two-columns {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
              }
              .column {
                width: 48%;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              td {
                padding: 4px 0;
                vertical-align: top;
              }
              .label {
                width: 40%;
                font-weight: bold;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                font-style: italic;
                color: #555;
                font-size: 11px;
              }
              .footer p {
                margin: 2px 0;
              }
              @media print {
                .receipt {
                  border: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <!-- Company Header -->
              <div class="header">
                <h1>Car Rental System</h1>
                <p>123 Main Street, City, Country</p>
                <p>Phone: (123) 456-7890 | Email: info@carrentals.com</p>
              </div>
              
              <!-- Receipt Title -->
              <div class="title">
                <h2>BOOKING RECEIPT #${booking.id}</h2>
                <p>Date: ${currentDate}</p>
              </div>
              
              <div class="two-columns">
                <!-- Left Column: Booking & Customer Details -->
                <div class="column">
                  <!-- Booking Information -->
                  <div class="section">
                    <h3>Booking Information</h3>
                    <table>
                      <tr>
                        <td class="label">Status:</td>
                        <td>${booking.status.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td class="label">Pickup Date:</td>
                        <td>${formatDate(booking.pickup_date).split(',')[0]}</td>
                      </tr>
                      <tr>
                        <td class="label">Return Date:</td>
                        <td>${formatDate(booking.return_date).split(',')[0]}</td>
                      </tr>
                      <tr>
                        <td class="label">Duration:</td>
                        <td>${calculateDuration()} days</td>
                      </tr>
                      <tr>
                        <td class="label">Location:</td>
                        <td>${booking.pickup_location || 'Main Office'}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Customer Information -->
                  <div class="section">
                    <h3>Customer Information</h3>
                    <table>
                      <tr>
                        <td class="label">Name:</td>
                        <td>${booking.user?.name || booking.customer_name}</td>
                      </tr>
                      <tr>
                        <td class="label">Email:</td>
                        <td>${booking.user?.email || booking.customer_email}</td>
                      </tr>
                      <tr>
                        <td class="label">Phone:</td>
                        <td>${booking.user?.phone || booking.customer_phone || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>
                </div>
                
                <!-- Right Column: Car & Payment -->
                <div class="column">
                  <!-- Car Information -->
                  <div class="section">
                    <h3>Car Information</h3>
                    <table>
                      <tr>
                        <td class="label">Car:</td>
                        <td>${car.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td class="label">Brand/Model:</td>
                        <td>${car.brand?.name || 'N/A'} ${car.model || ''}</td>
                      </tr>
                      <tr>
                        <td class="label">Year:</td>
                        <td>${car.year || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td class="label">License Plate:</td>
                        <td>${car.license_plate || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Payment Information -->
                  <div class="section">
                    <h3>Payment Information</h3>
                    <table>
                      <tr>
                        <td class="label">Daily Rate:</td>
                        <td>$${parseFloat(car.price || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Subtotal:</td>
                        <td>$${parseFloat(booking.subtotal || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Tax:</td>
                        <td>$${parseFloat(booking.tax_amount || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Total:</td>
                        <td style="font-weight: bold;">$${parseFloat(booking.total_price || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Payment Status:</td>
                        <td>${booking.payment_status?.toUpperCase() || 'PENDING'}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
              
              <!-- Terms and Conditions -->
              <div class="section">
                <h3>Terms & Conditions</h3>
                <p style="font-size: 10px; margin: 4px 0;">
                  1. The vehicle must be returned in the same condition as when received.
                  2. Full payment is due at time of rental unless otherwise arranged.
                  3. Additional charges may apply for late returns, damage, or excessive mileage.
                  4. Cancellation within 24 hours of pickup time may incur a cancellation fee.
                </p>
              </div>
              
              <!-- Thank You Note -->
              <div class="footer">
                <p>Thank you for choosing our Car Rental Service!</p>
                <p>For questions or assistance, please contact us at (123) 456-7890.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for resources to load then print
      setTimeout(() => {
        printWindow.print();
        toast.success('Printing receipt...');
      }, 500);
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Error printing receipt');
    }
  };
  
  // Helper function to calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                onClick={printBookingReceipt}
              >
                <i className="bi bi-printer me-2"></i>
                Print Receipt
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
                  <div className="d-flex flex-wrap gap-2">
                    {/* For pending bookings - option to confirm */}
                    {booking.status === 'pending' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-info"
                        onClick={() => handleUpdateStatus('confirmed')}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Confirm Booking
                      </button>
                    )}
                    
                    {/* For confirmed bookings - option to mark as picked up */}
                    {booking.status === 'confirmed' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={() => handleUpdateStatus('active')}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Mark as Picked Up
                      </button>
                    )}
                    
                    {/* For active bookings - option to mark as returned/completed */}
                    {booking.status === 'active' && (
                      <button 
                        type="button" 
                        className="btn btn-outline-success"
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-box-arrow-in-left me-1"></i>
                        Mark as Returned
                      </button>
                    )}
                    
                    {/* Cancel option available for pending, confirmed, and active bookings */}
                    {['pending', 'confirmed', 'active'].includes(booking.status) && (
                      <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={() => {
                          const reason = prompt('Enter cancellation reason:');
                          if (reason !== null) {
                            handleUpdateStatus('cancelled', reason);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel Booking
                      </button>
                    )}
                    
                    {/* Show status indicators */}
                    {isProcessing && (
                      <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Payment status controls */}
                  {booking.payment_status !== 'paid' && (
                    <div className="mt-3">
                      <h5>Payment Status</h5>
                      <button 
                        type="button" 
                        className="btn btn-outline-success"
                        onClick={() => handleUpdatePaymentStatus('paid')}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-credit-card me-1"></i>
                        Mark as Paid
                      </button>
                    </div>
                  )}
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
                      
                      {booking.car && (
                        <div className="mt-2 mb-3">
                          <span className="fw-bold me-2">Car Status:</span>
                          <span className={`badge bg-${getCarStatusColor(booking.car.status)}`}>
                            {booking.car.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      )}
                      
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
                        onClick={() => handleUpdatePaymentStatus('paid')}
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
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;