import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import { apiUrl } from './http';

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        console.log('Fetching featured cars from:', `${apiUrl}/featured-cars`);
        const response = await fetch(`${apiUrl}/featured-cars`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch featured cars');
        }
        
        const data = await response.json();
        console.log('Featured cars data:', data);
        setFeaturedCars(data.data || []);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedCars();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <section id="featured" className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold">Featured Vehicles</h2>
              <p className="lead text-muted">Explore our top selections this month</p>
            </div>
          </div>
          
          <div className="row g-4">
            {[1, 2, 3, 4].map(i => (
              <div className="col-md-6 col-lg-3 mb-4" key={i}>
                <div className="card shadow-sm h-100 placeholder-glow">
                  <div className="placeholder col-12" style={{height: "200px"}}></div>
                  <div className="card-body">
                    <h5 className="card-title placeholder col-10"></h5>
                    <p className="placeholder col-7"></p>
                    <div className="placeholder col-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    console.log('Rendering error state for featured cars');
    return (
      <section id="featured" className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold">Featured Vehicles</h2>
              <p className="lead text-muted text-danger">Unable to load featured cars. Please try again later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No featured cars to display
  if (featuredCars.length === 0) {
    console.log('No featured cars found');
    return (
      <section id="featured" className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold">Featured Vehicles</h2>
              <p className="lead text-muted">No featured vehicles are currently available.</p>
              <div className="mt-4">
                <Link to="/shop" className="btn btn-primary">Browse All Cars</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log('Rendering featured cars:', featuredCars.length);
  return (
    <section id="featured" className="py-5">
      <div className="container">
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h2 className="fw-bold">Featured Vehicles</h2>
            <p className="lead text-muted">Explore our top selections this month</p>
          </div>
        </div>
        
        {/* Featured Cars Grid */}
        <div className="row g-4">
          {featuredCars.map(car => (
            <div className="col-md-6 col-lg-3 mb-4" key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <Link to="/shop" className="btn btn-primary">View All Cars</Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;