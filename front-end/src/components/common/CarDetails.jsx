import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import { apiUrl } from './http';
import { useUserAuth } from '../../contexts/UserAuthContext';

// Car detail skeleton loader
const CarDetailSkeleton = () => {
  return (
    <div className="container py-5">
      <div className="placeholder-glow mb-4">
        <span className="placeholder col-2"></span>
      </div>
      
      <div className="row mb-5">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="bg-secondary placeholder w-100" style={{ height: "400px" }}></div>
        </div>
        <div className="col-lg-6">
          <div className="placeholder-glow">
            <h1 className="placeholder col-8 mb-2"></h1>
            <p className="placeholder col-4 mb-4"></p>
            
            <div className="card bg-light mb-4">
              <div className="card-body placeholder-glow">
                <h5 className="placeholder col-6 mb-4"></h5>
                <div className="row mb-2">
                  <div className="col-6 placeholder"></div>
                  <div className="col-6 placeholder"></div>
                </div>
                <div className="row">
                  <div className="col-6 placeholder"></div>
                  <div className="col-6 placeholder"></div>
                </div>
              </div>
            </div>
            
            <span className="placeholder col-12" style={{ height: "50px" }}></span>
          </div>
        </div>
      </div>
      
      <div className="card bg-light">
        <div className="card-body placeholder-glow">
          <h5 className="placeholder col-3 mb-3"></h5>
          <p className="placeholder col-12"></p>
          <p className="placeholder col-12"></p>
          <p className="placeholder col-8"></p>
        </div>
      </div>
    </div>
  );
};

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useUserAuth();
  
  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching car details from:', `${apiUrl}/cars/${id}`);
        const response = await fetch(`${apiUrl}/cars/${id}`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Car not found');
          }
          throw new Error(`Failed to fetch car details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Car details data:', data);
        if (!data.data) {
          throw new Error('Invalid response format from server');
        }
        
        setCar(data.data);
      } catch (error) {
        console.error('Error fetching car details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [id]);
  
  // Handle booking - redirect to login if not authenticated
  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(`/booking/${id}`);
    } else {
      // Save the intended destination for after login
      sessionStorage.setItem('bookingAfterLogin', `/booking/${id}`);
      // Show the login modal
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
    }
  };

  // If error fetching car
  if (error) {
    return (
      <>
        <div className="container py-5 mt-5 text-center">
          <div className="py-5">
            <i className="bi bi-exclamation-circle display-1 text-muted mb-4"></i>
            <h2>Car Not Found</h2>
            <p className="lead text-muted">{error}</p>
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
          <CarDetailSkeleton />
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

            <div className="row mb-5">
              {/* Car Image */}
              <div className="col-lg-6 mb-4 mb-lg-0">
                <img
                  src={car.image ? `http://localhost:8000/${car.image}` : 'https://via.placeholder.com/600x400?text=No+Image+Available'}
                  alt={car.name}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                  }}
                />
              </div>
              
              {/* Car Details */}
              <div className="col-lg-6">
                <h1 className="mb-2">{car.name}</h1>
                <div className="mb-3">
                  <span className="badge bg-secondary me-2">{car.brand?.name || 'Unknown Brand'}</span>
                  <span className="badge bg-secondary me-2">{car.category?.name || 'Unknown Category'}</span>
                  <span className="badge bg-secondary">{car.year}</span>
                </div>
                <p className="fs-4 text-primary mb-4">${parseFloat(car.price).toLocaleString()} <small className="text-muted">per day</small></p>
                
                {/* Status Badge */}
                <div className="mb-4">
                  {car.status === 'available' ? (
                    <span className="badge bg-success fs-6">Available Now</span>
                  ) : (
                    <span className="badge bg-danger fs-6">Currently Unavailable</span>
                  )}
                </div>
                
                {/* Specifications Card */}
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">Specifications</h5>
                    <div className="row mb-2">
                      <div className="col-6 d-flex align-items-center">
                        <i className="bi bi-fuel-pump me-2"></i>
                        <span>{car.fuel_type || 'Not specified'}</span>
                      </div>
                      <div className="col-6 d-flex align-items-center">
                        <i className="bi bi-speedometer2 me-2"></i>
                        <span>{car.mileage || 'Not specified'}</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6 d-flex align-items-center">
                        <i className="bi bi-gear me-2"></i>
                        <span>{car.transmission || 'Not specified'}</span>
                      </div>
                      <div className="col-6 d-flex align-items-center">
                        <i className="bi bi-tag me-2"></i>
                        <span>{car.condition}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Book Now Button */}
                <div className="mt-4">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/booking/${car.id}`);
                      } else {
                        // Show login modal or redirect to login
                        alert('Please login to book this car');
                        // Assuming you have a login modal with ID 'loginModal'
                        const loginModal = new window.bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                      }
                    }}
                    disabled={car.status !== 'available'}
                  >
                    {car.status === 'available' ? 'Book Now' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="card bg-light mb-4">
              <div className="card-body">
                <h5 className="mb-3">Description</h5>
                <p>{car.description || "No description available for this vehicle."}</p>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default CarDetails;