import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="mb-3">CarMarket</h5>
            <p className="text-white">Your trusted destination for quality vehicles since 2010. We're committed to helping you find the perfect car for your lifestyle and budget.</p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-white"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#" className="text-white"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-white"><i className="bi bi-twitter-x fs-5"></i></a>
              <a href="#" className="text-white"><i className="bi bi-youtube fs-5"></i></a>
            </div>
          </div>
          <div className="col-sm-6 col-lg-2">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-white">Home</Link></li>
              <li className="mb-2"><Link to="/shop" className="text-decoration-none text-white">Shop Cars</Link></li>
              <li className="mb-2"><a href="#about" className="text-decoration-none text-white">About Us</a></li>
              <li className="mb-2"><a href="#faq" className="text-decoration-none text-white">FAQs</a></li> text-white
            </ul>
          </div>
          <div className="col-sm-6 col-lg-3">
            <h5 className="mb-3">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><i className="bi bi-geo-alt me-2 text-white"></i> 123 Car Street, City, Country</li>
              <li className="mb-2"><i className="bi bi-telephone me-2 text-white"></i> (123) 456-7890</li>
              <li className="mb-2"><i className="bi bi-envelope me-2 text-white"></i> info@carmarket.com</li>
              <li className="mb-2"><i className="bi bi-clock me-2 text-white"></i> Mon-Sat: 9AM-6PM</li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h5 className="mb-3">Newsletter</h5>
            <p className="text-white">Subscribe to get updates on new arrivals and special offers</p>
            <div className="input-group">
              <input type="email" className="form-control" placeholder="Your email" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </div>
        </div>
        <hr className="mt-4 mb-3" />
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-white mb-md-0">© 2023 CarMarket. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-white text-decoration-none me-3">Privacy Policy</a>
            <a href="#" className="text-white text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;