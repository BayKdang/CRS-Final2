import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { apiUrl } from './http';
import { checkAvailability, createBooking } from '../../services/bookingService';
import Footer from './Footer';
import Navbar from './Navbar';

// Assuming this component already exists - we're just updating it
const Booking = () => {
  const { id: carId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [formData, setFormData] = useState({
    car_id: carId,
    pickup_date: '',
    return_date: '',
    pickup_location: '',
    return_location: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });
  
  // Calculate rental days and total price
  const [rentalDays, setRentalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${apiUrl}/cars/${carId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        
        const data = await response.json();
        
        // Debug the response to see what we're getting
        console.log("API Response:", data);
        
        // More flexible check - look for car data in any property
        if (data && (data.data || data.car)) {
          setCar(data.data || data.car);
          
          // Prefill form with user data if available
          if (user) {
            setFormData(prev => ({
              ...prev,
              customer_name: user.name || '',
              customer_email: user.email || ''
            }));
          }
        } else {
          console.error("Unexpected API response format:", data);
          throw new Error('Could not find car data in the server response');
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId, user]);
  
  // Calculate rental duration and price whenever dates change
  useEffect(() => {
    if (formData.pickup_date && formData.return_date && car) {
      const pickup = new Date(formData.pickup_date);
      const returnDate = new Date(formData.return_date);
      
      // Calculate difference in days
      const diffTime = Math.abs(returnDate - pickup);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setRentalDays(diffDays);
      setTotalPrice(car.price * diffDays);
    }
  }, [formData.pickup_date, formData.return_date, car]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset availability check when dates change
    if (name === 'pickup_date' || name === 'return_date') {
      setIsAvailable(true);
    }
  };
  
  // Check availability
  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    
    if (!formData.pickup_date || !formData.return_date) {
      setError('Please select pickup and return dates');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await checkAvailability(
        carId,
        formData.pickup_date,
        formData.return_date,
        user.token
      );
      
      setIsAvailable(result.available);
      if (!result.available) {
        setError('This car is not available for the selected dates');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Error checking availability. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAvailable) {
      setError('This car is not available for the selected dates');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await createBooking({
        car_id: carId,
        pickup_date: formData.pickup_date,
        return_date: formData.return_date,
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        notes: formData.notes
      }, user.token);
      
      if (result.success) {
        // Navigate to checkout page with booking ID
        navigate(`/checkout/${result.data.id}`);
      } else {
        setError(result.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Error creating booking. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${carId}` } });
    }
  }, [isAuthenticated, navigate, carId]);
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 mt-5">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading car details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container py-5 mt-5">
        <div className="row">
          <div className="col-md-8">
            <h2 className="mb-4">Book Your Car</h2>
            
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
            
            {car && (
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      {car.image ? (
                        <img 
                          src={`${apiUrl.replace('/api', '')}/${car.image}`} 
                          alt={car.name} 
                          className="img-fluid rounded"
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{height: '150px'}}>
                          <i className="bi bi-car-front fs-1 text-secondary"></i>
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <h4>{car.name}</h4>
                      <p className="text-muted">
                        {car.brand?.name && `${car.brand.name} • `}
                        {car.category?.name}
                      </p>
                      <div className="mb-2">
                        <span className="badge bg-primary me-2">${car.price}/day</span>
                        <span className={`badge bg-${car.status === 'available' ? 'success' : 'warning'}`}>
                          {car.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Rental Details</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="pickup_date" className="form-label">Pickup Date*</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        id="pickup_date" 
                        name="pickup_date"
                        value={formData.pickup_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="return_date" className="form-label">Return Date*</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        id="return_date" 
                        name="return_date"
                        value={formData.return_date}
                        onChange={handleChange}
                        min={formData.pickup_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-primary mb-3"
                    onClick={handleCheckAvailability}
                    disabled={isSubmitting || !formData.pickup_date || !formData.return_date}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Checking...
                      </>
                    ) : 'Check Availability'}
                  </button>
                  
                  {isAvailable && formData.pickup_date && formData.return_date && (
                    <>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="pickup_location" className="form-label">Pickup Location*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="pickup_location" 
                            name="pickup_location"
                            value={formData.pickup_location}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="return_location" className="form-label">Return Location*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="return_location" 
                            name="return_location"
                            value={formData.return_location}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {isAvailable && formData.pickup_date && formData.return_date && (
                <>
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Personal Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="customer_name" className="form-label">Full Name*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="customer_name" 
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="customer_phone" className="form-label">Phone Number*</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            id="customer_phone" 
                            name="customer_phone"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="customer_email" className="form-label">Email Address*</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="customer_email" 
                          name="customer_email"
                          value={formData.customer_email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="notes" className="form-label">Additional Notes</label>
                        <textarea 
                          className="form-control" 
                          id="notes" 
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Booking Summary</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Rental Period:</span>
                        <span>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Daily Rate:</span>
                        <span>${car?.price || 0}/day</span>
                      </div>
                      <div className="d-flex justify-content-between font-weight-bold">
                        <strong>Total:</strong>
                        <strong>${totalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : 'Continue to Payment'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          
          <div className="col-md-4">
            <div className="card sticky-top" style={{top: '100px'}}>
              <div className="card-header bg-light">
                <h5 className="mb-0">Booking Instructions</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-calendar-check me-2 text-primary"></i>
                    Select your pickup and return dates
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    Choose your pickup and return locations
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    Provide your personal information
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-credit-card me-2 text-primary"></i>
                    Proceed to checkout to complete your booking
                  </li>
                </ul>
                <hr />
                <p className="mb-0 small text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  You'll only be charged after confirming your booking on the next page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Booking;