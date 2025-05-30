import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="hero" className="bg-dark text-white position-relative">
      <div className="position-absolute w-100 h-100" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: '0.4'
      }}></div>
      <div className="container position-relative py-5" style={{ zIndex: 1 }}>
        <div className="row min-vh-75 align-items-center py-5">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">Find Your Perfect Drive</h1>
            <p className="lead mb-4">
              Discover our selection of premium used and new vehicles. 
              Quality cars at competitive prices, with financing options available.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Browse Cars
              </Link>
              <a href="#about" className="btn btn-outline-light btn-lg">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;