import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  if (!car) return null;
  
  const imageUrl = car.image 
    ? `http://localhost:8000/${car.image}` 
    : 'https://via.placeholder.com/300x200?text=No+Image';
    
  // Handle cases where price might be formatted differently
  const formatPrice = (price) => {
    if (!price) return '$0';
    const numPrice = parseFloat(price);
    return `$${numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="card shadow-sm h-100">
      <img 
        src={imageUrl}
        className="card-img-top" 
        alt={car.name} 
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
        }}
      />
      
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{car.name}</h5>
        <p className="card-text text-muted mb-3">
          {car.year} • {car.condition || 'N/A'}
          {car.brand?.name && ` • ${car.brand.name}`}
        </p>
        
        <div className="small text-muted mb-3">
          <div className="row g-2">
            <div className="col-6">
              <i className="bi bi-fuel-pump me-1"></i>
              {car.fuel_type || 'N/A'}
            </div>
            <div className="col-6">
              <i className="bi bi-gear me-1"></i>
              {car.transmission || 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="fs-5 fw-bold">{formatPrice(car.price)}</span>
          <Link to={`/car/${car.id}`} className="btn btn-outline-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;