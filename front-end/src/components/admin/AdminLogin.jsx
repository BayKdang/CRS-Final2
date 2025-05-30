import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, admin } = useAdminAuth(); // Add admin here
  const navigate = useNavigate();

  // Add this effect to handle navigation after successful login
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      toast.success('Login successful');
      // The useEffect will handle navigation
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body p-5">
          <h4 className="text-center mb-4">Admin Login</h4>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
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
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 mt-3" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;