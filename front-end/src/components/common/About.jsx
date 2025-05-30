import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-5 bg-light">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <img 
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600" 
              alt="Car Dealership" 
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-lg-6">
            <h2 className="fw-bold mb-4">About CarMarket</h2>
            <p className="lead">
              We're passionate about connecting drivers with their perfect vehicles.
            </p>
            <p>
              Since 2010, CarMarket has been a trusted destination for car buyers in the region. 
              We offer a carefully selected inventory of high-quality new and pre-owned vehicles, 
              comprehensive financing options, and exceptional customer service.
            </p>
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill text-primary me-2 fs-5"></i>
                  <span>Quality Verified Vehicles</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill text-primary me-2 fs-5"></i>
                  <span>Flexible Financing Options</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill text-primary me-2 fs-5"></i>
                  <span>Transparent Pricing</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill text-primary me-2 fs-5"></i>
                  <span>Expert Customer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;