import React, { useState, useEffect, useRef } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';

const LoginModal = () => {
  const { login } = useUserAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const bootstrapModalRef = useRef(null);
  
  // Initialize the Bootstrap modal when the component mounts
  useEffect(() => {
    if (modalRef.current) {
      // Import Bootstrap's Modal directly
      import('bootstrap/js/dist/modal').then(({ default: Modal }) => {
        bootstrapModalRef.current = new Modal(modalRef.current);
        
        // Add event listener for when modal is hidden
        modalRef.current.addEventListener('hidden.bs.modal', () => {
          setFormData({ email: '', password: '' });
          setError(null);
          
          // Clean up any remaining backdrop
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          // Remove modal-open class from body
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        });
      });
    }
    
    // Cleanup when component unmounts
    return () => {
      if (bootstrapModalRef.current) {
        bootstrapModalRef.current.dispose();
      }
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(formData);
      
      // Close the modal safely
      if (bootstrapModalRef.current) {
        bootstrapModalRef.current.hide();
      }
      
      // Check if there's a booking redirect
      const pendingBooking = sessionStorage.getItem('bookingAfterLogin');
      if (pendingBooking) {
        sessionStorage.removeItem('bookingAfterLogin');
        window.location.href = pendingBooking;
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade" id="loginModal" ref={modalRef} tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="loginModalLabel">Login to Your Account</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
              </div>
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : 'Login'}
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <a href="#" className="text-decoration-none">Forgot password?</a>
              <p className="mt-2 mb-0">Don't have an account? <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">Sign up</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;