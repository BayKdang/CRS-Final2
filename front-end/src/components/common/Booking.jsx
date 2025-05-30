import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { apiUrl } from './http';
import { useUserAuth } from '../../contexts/UserAuthContext';

// Booking page skeleton
const BookingSkeleton = () => {
  return (
    <div className="container py-5">
      <div className="placeholder-glow mb-4">
        <span className="placeholder col-2"></span>
      </div>
      
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card bg-light mb-4">
            <div className="card-body placeholder-glow">
              <h5 className="placeholder col-6 mb-3"></h5>
              <div className="d-flex mb-4">
                <div className="placeholder bg-secondary me-3" style={{ width: "100px", height: "100px" }}></div>
                <div>
                  <h6 className="placeholder col-8 mb-2"></h6>
                  <p className="placeholder col-4"></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-light">
            <div className="card-body placeholder-glow">
              <h5 className="placeholder col-6 mb-3"></h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <span className="placeholder col-12" style={{ height: "40px" }}></span>
                </div>
                <div className="col-md-6">
                  <span className="placeholder col-12" style={{ height: "40px" }}></span>
                </div>
                <div className="col-md-6">
                  <span className="placeholder col-12" style={{ height: "40px" }}></span>
                </div>
                <div className="col-md-6">
                  <span className="placeholder col-12" style={{ height: "40px" }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card bg-light mb-4">
            <div className="card-body placeholder-glow">
              <h5 className="placeholder col-8 mb-4"></h5>
              <div className="placeholder col-12 mb-3" style={{ height: "250px" }}></div>
              <div className="placeholder col-12" style={{ height: "50px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useUserAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupLocation: '',
    dropoffLocation: '',
    additionalNotes: ''
  });
  
  // Date selection
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // Fetch car data from API
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!user?.token) {
          // Redirect to login if not authenticated
          sessionStorage.setItem('bookingAfterLogin', `/booking/${id}`);
          navigate('/');
          return;
        }
        
        // Fetch car details from API
        const response = await fetch(`${apiUrl}/cars/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        
        const data = await response.json();
        setCar(data.data);
        
        // Pre-fill form with user data if available
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [id, user, navigate]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Calculate rental duration in days
  const calculateDuration = () => {
    if (!dateRange.startDate || !dateRange.endDate) return 0;
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Include both start and end days
  };
  
  // Calculate total cost
  const calculateTotal = () => {
    const duration = calculateDuration();
    const dailyRate = car?.price || 0;
    const subtotal = dailyRate * duration;
    const tax = subtotal * 0.1; // 10% tax
    return (subtotal + tax).toLocaleString();
  };
  
  // Handle form submission - connect to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!dateRange.startDate || !dateRange.endDate) {
      alert("Please select rental dates");
      return;
    }
    
    if (Object.values(formData).some(value => !value)) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      // Create booking in the database
      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          car_id: car.id,
          pickup_date: dateRange.startDate,
          return_date: dateRange.endDate,
          pickup_location: formData.pickupLocation,
          return_location: formData.dropoffLocation,
          notes: formData.additionalNotes,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      const bookingData = await response.json();
      
      // Navigate to checkout with the booking ID
      navigate(`/checkout/${bookingData.data.id}`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Failed to create booking: ${error.message}`);
    }
  };
  
  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // If car not found
  if (!car && !isLoading) {
    return (
      <>
        <div className="container py-5 mt-5 text-center">
          <div className="py-5">
            <i className="bi bi-exclamation-circle display-1 text-muted mb-4"></i>
            <h2>Car Not Found</h2>
            <p className="lead text-muted">The car you're looking for doesn't exist.</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/shop')}
            >
              Browse Available Cars
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
        {isLoading ? (
          <BookingSkeleton />
        ) : (
          <div className="container py-5 mt-5 flex-grow-1">
            {/* Back Button */}
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            
            <h1 className="mb-4">Book Your Rental</h1>
            
            <div className="row">
              {/* Booking Form */}
              <div className="col-lg-8 mb-4">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Selected Vehicle</h5>
                    <div className="d-flex mb-3">
                      <img 
                        src={`${car ? 'http://localhost:8000/' + car.image : ''}`}
                        alt={car?.name}
                        className="rounded me-3"
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="mb-1">{car?.name}</h6>
                        <p className="text-primary mb-0">${parseFloat(car?.price || 0).toLocaleString()} per day</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Personal Information</h5>
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="phone" className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="pickupLocation" className="form-label">Pickup Location</label>
                          <input
                            type="text"
                            className="form-control"
                            id="pickupLocation"
                            name="pickupLocation"
                            value={formData.pickupLocation}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="dropoffLocation" className="form-label">Drop-off Location</label>
                          <input
                            type="text"
                            className="form-control"
                            id="dropoffLocation"
                            name="dropoffLocation"
                            value={formData.dropoffLocation}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="additionalNotes" className="form-label">Additional Notes</label>
                          <input
                            type="text"
                            className="form-control"
                            id="additionalNotes"
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              {/* Booking Summary */}
              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Booking Summary</h5>
                    
                    {/* Date Picker */}
                    <div className="mb-4">
                      <label className="form-label">Select Rental Dates</label>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small text-muted">Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-muted">End Date</label>
                          <input
                            type="date"
                            className="form-control"
                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    {dateRange.startDate && dateRange.endDate && (
                      <div className="bg-light p-3 rounded mb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Duration:</span>
                          <span>{calculateDuration()} days</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Daily Rate:</span>
                          <span>${car.price.toLocaleString()}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total:</span>
                          <span>${calculateTotal()}</span>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-primary w-100"
                      onClick={handleSubmit}
                      disabled={!dateRange.startDate || !dateRange.endDate}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default Booking;