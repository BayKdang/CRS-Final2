import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { apiUrl } from './http';
import Footer from './Footer';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useUserAuth();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch booking details from API
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!user?.token) {
          navigate('/');
          return;
        }
        
        const response = await fetch(`${apiUrl}/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBooking(data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Could not load booking details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooking();
  }, [id, user, navigate]);

  // Payment info state
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  });

  // Handle payment info change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: value
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

  // Process payment
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (Object.values(paymentInfo).some(value => !value)) {
      alert("Please fill in all payment fields");
      return;
    }
    
    // Show loading state
    setIsProcessing(true);
    
    try {
      // In a real app, you'd integrate with a payment gateway here
      // For this example, we'll simulate a payment process
      
      // Update booking status to 'confirmed' after payment
      const response = await fetch(`${apiUrl}/admin/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: 'confirmed',
          payment_status: 'paid'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Payment successful
      setTimeout(() => {
        setIsProcessing(false);
        setIsPaymentComplete(true);
      }, 1500);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="container py-5 mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading checkout information...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <>
        <div className="container py-5 mt-5">
          <div className="alert alert-danger">
            <h4>Error</h4>
            <p>{error || 'Booking not found'}</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => navigate('/shop')}
            >
              Browse Cars
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-vh-100 d-flex flex-column">
        <div className="container py-5 mt-5 flex-grow-1">
          {/* Back button */}
          {!isPaymentComplete && (
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Booking
            </button>
          )}
          
          <div className="row">
            {/* Payment Form */}
            <div className="col-lg-8 mb-4">
              {isPaymentComplete ? (
                <div className="card shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-check-circle-fill text-success display-1"></i>
                    </div>
                    <h2 className="mb-3">Payment Successful!</h2>
                    <p className="lead text-muted mb-4">
                      Your booking has been confirmed and a receipt has been sent to your email.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/bookings')}
                      >
                        View My Bookings
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => window.print()}
                      >
                        <i className="bi bi-printer me-2"></i>
                        Print Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h2 className="card-title mb-4">Payment Information</h2>
                    <form onSubmit={handlePayment}>
                      <div className="mb-3">
                        <label htmlFor="cardName" className="form-label">Cardholder Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardName"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="cardNumber" className="form-label">Card Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={paymentInfo.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="cvv" className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                        <textarea
                          className="form-control"
                          id="billingAddress"
                          name="billingAddress"
                          rows="3"
                          value={paymentInfo.billingAddress}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="saveInfo" />
                        <label className="form-check-label" htmlFor="saveInfo">Save my payment information for future bookings</label>
                      </div>
                      
                      <div className="d-grid">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Processing...
                            </>
                          ) : (
                            `Complete Payment ($${parseFloat(booking.total_price).toFixed(2)})`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-4">Booking Summary</h5>
                  
                  {booking.car && (
                    <div className="d-flex mb-4">
                      <img 
                        src={booking.car ? `http://localhost:8000/${booking.car.image}` : ''} 
                        alt={booking.car?.name}
                        className="rounded me-3"
                        style={{ width: "70px", height: "70px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="mb-1">{booking.car?.name}</h6>
                        <p className="text-primary mb-0">${parseFloat(booking.car?.price || 0).toFixed(2)} per day</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Pickup Date:</span>
                      <span>{new Date(booking.pickup_date).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Return Date:</span>
                      <span>{new Date(booking.return_date).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Duration:</span>
                      <span>{calculateDuration()} days</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Pickup Location:</span>
                      <span>{booking.pickup_location}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Return Location:</span>
                      <span>{booking.return_location}</span>
                    </div>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${parseFloat(booking.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="mb-3">Secure Payment</h6>
                  <p className="small text-muted mb-3">
                    We use industry-standard encryption to protect your personal information.
                  </p>
                  <div className="d-flex justify-content-between">
                    <i className="bi bi-credit-card fs-4"></i>
                    <i className="bi bi-paypal fs-4"></i>
                    <i className="bi bi-apple fs-4"></i>
                    <i className="bi bi-google fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;