import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { apiUrl } from './http';
import { processPayment } from '../../services/bookingService';
import Footer from './Footer';
import Navbar from './Navbar';

// Assuming this component already exists - we're just updating it
const Checkout = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!isAuthenticated || !user?.token) {
        navigate('/login', { state: { from: `/checkout/${bookingId}` } });
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`${apiUrl}/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        if (data.success) {
          setBooking(data.data);
          setCar(data.data.car);
        } else {
          throw new Error(data.message || 'Failed to load booking details');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate, isAuthenticated, user]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: value
    });
  };
  
  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Process payment
      const result = await processPayment(bookingId, user.token);
      
      if (result.success) {
        // Payment succeeded
        setSuccess(true);
        
        // Also update booking status to 'confirmed' which will mark car as 'reserved'
        await fetch(`${apiUrl}/bookings/${bookingId}/confirm`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        // Show success message for a few seconds then redirect
        setTimeout(() => {
          navigate('/bookings');
        }, 3000);
      } else {
        setError(result.message || 'Payment processing failed');
      }
    } catch (err) {
      setError('An error occurred during payment processing. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 mt-5">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error && !booking) {
    return (
      <>
        <Navbar />
        <div className="container py-5 mt-5">
          <div className="alert alert-danger">{error}</div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container py-5 mt-5">
        <h2 className="mb-4">Complete Your Booking</h2>
        
        {success ? (
          <div className="card border-success">
            <div className="card-body text-center py-5">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
              <h3 className="mt-3">Payment Successful!</h3>
              <p>Your booking has been confirmed. You will be redirected to your bookings shortly...</p>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-7 mb-4">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Payment Information</h5>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="cardName" className="form-label">Cardholder Name*</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="cardName" 
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="cardNumber" className="form-label">Card Number*</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="cardNumber" 
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handleChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required
                      />
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="expiryDate" className="form-label">Expiry Date*</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="expiryDate" 
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="cvv" className="form-label">CVV*</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="cvv" 
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="d-grid mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : `Pay $${booking?.total_price || 0}`}
                      </button>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        <i className="bi bi-shield-lock me-1"></i>
                        This is a demo - no actual payment will be processed
                      </small>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="col-md-5">
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Booking Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>Car Details</h6>
                    <div className="d-flex align-items-center">
                      {car?.image ? (
                        <img 
                          src={`${apiUrl.replace('/api', '')}/${car.image}`}
                          alt={car.name}
                          className="img-thumbnail me-3"
                          style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center me-3 rounded" style={{width: '70px', height: '70px'}}>
                          <i className="bi bi-car-front fs-3 text-secondary"></i>
                        </div>
                      )}
                      <div>
                        <h6 className="mb-0">{car?.name}</h6>
                        <small className="text-muted">
                          {car?.brand?.name} | {car?.category?.name}
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Rental Period</h6>
                    <p className="mb-1">
                      <i className="bi bi-calendar me-2"></i>
                      {new Date(booking?.pickup_date).toLocaleDateString()} - {new Date(booking?.return_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Locations</h6>
                    <p className="mb-1">
                      <strong>Pickup:</strong> {booking?.pickup_location}
                    </p>
                    <p className="mb-0">
                      <strong>Return:</strong> {booking?.return_location}
                    </p>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>${parseFloat(booking?.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Tax:</span>
                    <span>${parseFloat(booking?.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${parseFloat(booking?.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <p className="mb-2 small">
                    <i className="bi bi-info-circle me-2 text-primary"></i>
                    This is a demo payment page. No actual payment will be processed.
                  </p>
                  <p className="mb-0 small">
                    <i className="bi bi-shield-check me-2 text-primary"></i>
                    Your information is secure and will not be stored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;