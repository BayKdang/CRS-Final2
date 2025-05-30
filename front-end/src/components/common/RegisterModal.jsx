import React, { useState, useEffect, useRef } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';

const RegisterModal = () => {
  const { register } = useUserAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
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
          // Reset form state
          setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
          });
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
    
    // Validate password match
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      
      // Close the modal safely using the bootstrapModalRef
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
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade" id="registerModal" ref={modalRef} tabIndex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registerModalLabel">Create an Account</h5>
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
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
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
                  minLength="6"
                />
                <div className="form-text">Password must be at least 6 characters long.</div>
              </div>
              <div className="mb-3">
                <label htmlFor="password_confirmation" className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password_confirmation" 
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="termsAgree" required />
                <label className="form-check-label" htmlFor="termsAgree">I agree to the <a href="#">Terms and Conditions</a></label>
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
                      Creating Account...
                    </>
                  ) : 'Register'}
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <p className="mb-0">Already have an account? <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;