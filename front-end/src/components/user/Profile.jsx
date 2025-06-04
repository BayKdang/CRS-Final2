import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext'; // Make sure this matches what you use elsewhere
import { toast } from 'react-toastify';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useUserAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  // Form state for profile editing
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    country: '',
    driving_license: '',
    avatar: null
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Password change functionality
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Initialize user data when authenticated
  useEffect(() => {
    // Add debugging to see what's happening
    console.log("Profile auth check:", { isAuthenticated, authLoading, user });
    
    // Don't proceed if still loading
    if (authLoading) {
      return;
    }

    
    // IMPORTANT: Check localStorage directly as a backup
    const token = localStorage.getItem('userAuth');
    
    // Only redirect if definitely not authenticated AND no token in storage
    if (!isAuthenticated && !user && !token) {
      console.log("No authentication found, redirecting to home");
      navigate('/');
      
      // Try to show login modal
      setTimeout(() => {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
          const bsModal = new bootstrap.Modal(loginModal);
          bsModal.show();
        }
      }, 100);
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  useEffect(() => {
  // Only try to fetch profile if user is authenticated with a token
  if (user && user.token) {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user profile data...");
        
        const response = await fetch('http://localhost:8000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          console.error(`Profile API error: ${response.status}`);
          throw new Error(`Failed to fetch profile data: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("Profile API response:", responseData);
        
        // Handle different response structures
        let profileData = null;
        
        if (responseData.user) {
          profileData = responseData.user;
        } else if (responseData.data) {
          profileData = responseData.data;
        } else if (responseData.status === 200) {
          profileData = responseData; // The response might be the profile directly
        }
        
        if (profileData) {
          console.log("Profile data extracted:", profileData);
          
          // Set user profile with the complete data
          setUserProfile(prevProfile => ({
            ...user, // Preserve auth data like token
            ...(prevProfile || {}), // Keep any existing profile data
            ...profileData // Override with new profile data
          }));
          
          // Initialize form data with profile values
          setFormData({
            name: profileData.name || user.name || '',
            phone: profileData.phone || '',
            dob: profileData.dob || '',
            address: profileData.address || '',
            city: profileData.city || '',
            country: profileData.country || '',
            driving_license: profileData.driving_license || '',
          });
          
          if (profileData.avatar) {
            setAvatarPreview(`http://localhost:8000/${profileData.avatar}`);
          }
        } else {
          // If no profile data found but user exists, initialize with basic user data
          console.log("No detailed profile data found, using basic user info");
          setUserProfile(user);
          setFormData({
            name: user.name || '',
            phone: '',
            dob: '',
            address: '',
            city: '',
            country: '',
            driving_license: '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        // Fallback to using basic user data from auth
        setUserProfile(user);
        setFormData({
          name: user.name || '',
          phone: '',
          dob: '',
          address: '',
          city: '',
          country: '',
          driving_license: '',
        });
        
        toast.error('Could not load complete profile information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }
}, [user]);
  

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      setFormData(prev => ({
        ...prev,
        avatar: files[0]
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = async (e) => {
  e.preventDefault();
  
  if (!user || !user.token) {
    toast.error("You must be logged in to update your profile");
    return;
  }

  try {
    setIsLoading(true);
    // Create FormData to handle file upload
    const submitData = new FormData();
    
    // Add Laravel method spoofing for PUT requests with FormData
    submitData.append('_method', 'PUT');
    
    // Append form fields to FormData
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });
    
    console.log("Updating profile with data:", Object.fromEntries(submitData));

    // Make the update request - using POST with _method=PUT for proper form handling
    const response = await fetch('http://localhost:8000/api/user/profile', {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${user.token}`
        // Note: Don't set Content-Type when sending FormData
      },
      body: submitData
    });

    // Handle server response
    if (!response.ok) {
      let errorMessage = `Failed to update profile (Status: ${response.status})`;
      
      // Try to parse error as JSON, but handle non-JSON responses too
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse response data
    const responseData = await response.json();
    
    if (responseData.success || responseData.status === 200) {
      // Update local user profile with new data
      const updatedProfile = {
        ...userProfile,
        ...responseData.data || responseData.user || {}
      };
      
      setUserProfile(updatedProfile);
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } else {
      throw new Error(responseData.message || "Failed to update profile");
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // More descriptive error for the user based on response status
    if (error.message.includes('405')) {
      toast.error('Server configuration issue. Please try again later or contact support.');
    } else {
      toast.error(error.message || 'Error updating profile');
    }
  } finally {
    setIsLoading(false);
  }
};
  
  // Password related handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when field changes
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!passwordForm.password) {
      newErrors.password = 'New password is required';
    } else if (passwordForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!passwordForm.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your new password';
    } else if (passwordForm.password !== passwordForm.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setIsSubmittingPassword(true);
      
      const response = await fetch('http://localhost:8000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordForm)
      });

      if (!response.ok) {
        let errorMessage = "Failed to change password";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      toast.success('Password changed successfully. Please log in with your new password.');
      
      // Reset form
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Error changing password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Display loading state while checking authentication
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 mt-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Render the main profile content
  return (
    <>
      <Navbar />
      <div className="bg-light py-5">
        <div className="container mt-4">
          <div className="row">
            {/* Sidebar Navigation */}
            <div className="col-lg-3 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center py-4">
                  <img 
                    src={userProfile?.avatar ? `http://localhost:8000/${userProfile.avatar}` : DEFAULT_AVATAR} 
                    alt={userProfile?.name || 'User'} 
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                  />
                  <h5 className="mb-1">{userProfile?.name || 'User'}</h5>
                  <p className="text-muted small mb-0">{userProfile?.email}</p>
                </div>
                <div className="list-group list-group-flush">
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-2"></i> Personal Information
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                  >
                    <i className="bi bi-calendar-check me-2"></i> My Bookings
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="bi bi-key me-2"></i> Change Password
                  </button>
                  <button 
                    className="list-group-item list-group-item-action text-danger"
                    onClick={logout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="col-lg-9">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  {/* Profile Information Tab */}
                  {activeTab === 'profile' && !isEditing && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Personal Information</h4>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => setIsEditing(true)}
                        >
                          <i className="bi bi-pencil me-2"></i>Edit Information
                        </button>
                      </div>
                      
                      <div className="card border-0 mb-4">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Name:</div>
                            <div className="col-md-8 fw-medium">{userProfile?.name || 'Not provided'}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Email:</div>
                            <div className="col-md-8 fw-medium">{userProfile?.email}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Phone:</div>
                            <div className="col-md-8">{userProfile?.phone || 'Not provided'}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Date of Birth:</div>
                            <div className="col-md-8">{userProfile?.dob ? formatDate(userProfile.dob) : 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <h5 className="mb-3">Address Information</h5>
                      <div className="card border-0 mb-4">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Address:</div>
                            <div className="col-md-8">{userProfile?.address || 'Not provided'}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">City:</div>
                            <div className="col-md-8">{userProfile?.city || 'Not provided'}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Country:</div>
                            <div className="col-md-8">{userProfile?.country || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <h5 className="mb-3">Driving Information</h5>
                      <div className="card border-0">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-4 text-muted">Driving License:</div>
                            <div className="col-md-8">{userProfile?.driving_license || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Edit Profile Form */}
                  {activeTab === 'profile' && isEditing && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Edit Profile</h4>
                        <button 
                          className="btn btn-outline-secondary" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <form onSubmit={handleProfileUpdate}>
                        {/* <div className="mb-4 text-center">
                          {avatarPreview || userProfile?.avatar ? (
                            <img 
                              src={avatarPreview || `http://localhost:8000/${userProfile.avatar}`} 
                              alt="Profile Preview" 
                              className="rounded-circle img-thumbnail mb-3"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" 
                              style={{ width: '150px', height: '150px', border: '1px dashed #ccc' }}>
                              <i className="bi bi-person text-muted" style={{ fontSize: '3rem' }}></i>
                            </div>
                          )} */}
                          
                          {/* <div className="mb-3">
                            <label htmlFor="avatar" className="btn btn-sm btn-outline-primary">
                              Change Photo
                            </label>
                            <input 
                              type="file" 
                              id="avatar" 
                              name="avatar"
                              className="d-none"
                              accept="image/*"
                              onChange={handleInputChange}
                            />
                          </div>
                        </div> */}
                        
                        <h5 className="mb-3">Personal Information</h5>
                        <div className="card border-0 mb-4">
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="name" 
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input 
                                  type="email" 
                                  className="form-control" 
                                  id="email" 
                                  value={userProfile?.email}
                                  disabled
                                />
                                <div className="form-text">Email cannot be changed</div>
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
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label htmlFor="dob" className="form-label">Date of Birth</label>
                                <input 
                                  type="date" 
                                  className="form-control" 
                                  id="dob" 
                                  name="dob"
                                  value={formData.dob}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <h5 className="mb-3">Address Information</h5>
                        <div className="card border-0 mb-4">
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-12">
                                <label htmlFor="address" className="form-label">Address</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="address" 
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label htmlFor="city" className="form-label">City</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="city" 
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label htmlFor="country" className="form-label">Country</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="country" 
                                  name="country"
                                  value={formData.country}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <h5 className="mb-3">Driving Information</h5>
                        <div className="card border-0 mb-4">
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-12">
                                <label htmlFor="driving_license" className="form-label">Driving License Number</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="driving_license" 
                                  name="driving_license"
                                  value={formData.driving_license}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-end mt-4">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary me-2"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Saving...
                              </>
                            ) : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                  
                  {/* Bookings Tab */}
                  {activeTab === 'bookings' && (
                    <div className="embedded-bookings">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">My Bookings</h4>
                      </div>
                      
                      {/* My Bookings Content */}
                      <MyBookingsContent />
                    </div>
                  )}
                  
                  {/* Password Change Tab */}
                  {activeTab === 'password' && (
                    <>
                      <h4 className="mb-4">Change Password</h4>
                      
                      <div className="row justify-content-center">
                        <div className="col-md-10">
                          <div className="card shadow-sm">
                            <div className="card-body p-4">
                              <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3">
                                  <label htmlFor="current_password" className="form-label">Current Password</label>
                                  <input 
                                    type="password" 
                                    className={`form-control ${passwordErrors.current_password ? 'is-invalid' : ''}`}
                                    id="current_password" 
                                    name="current_password"
                                    value={passwordForm.current_password}
                                    onChange={handlePasswordChange}
                                  />
                                  {passwordErrors.current_password && (
                                    <div className="invalid-feedback">{passwordErrors.current_password}</div>
                                  )}
                                </div>
                                
                                <div className="mb-3">
                                  <label htmlFor="password" className="form-label">New Password</label>
                                  <input 
                                    type="password" 
                                    className={`form-control ${passwordErrors.password ? 'is-invalid' : ''}`}
                                    id="password" 
                                    name="password"
                                    value={passwordForm.password}
                                    onChange={handlePasswordChange}
                                  />
                                  {passwordErrors.password && (
                                    <div className="invalid-feedback">{passwordErrors.password}</div>
                                  )}
                                  <div className="form-text">
                                    Password must be at least 8 characters long
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <label htmlFor="password_confirmation" className="form-label">Confirm New Password</label>
                                  <input 
                                    type="password" 
                                    className={`form-control ${passwordErrors.password_confirmation ? 'is-invalid' : ''}`}
                                    id="password_confirmation" 
                                    name="password_confirmation"
                                    value={passwordForm.password_confirmation}
                                    onChange={handlePasswordChange}
                                  />
                                  {passwordErrors.password_confirmation && (
                                    <div className="invalid-feedback">{passwordErrors.password_confirmation}</div>
                                  )}
                                </div>
                                
                                <div className="alert alert-warning mb-4">
                                  <i className="bi bi-exclamation-triangle me-2"></i>
                                  After changing your password, you will be logged out and need to log in again with your new password.
                                </div>
                                
                                <div className="d-grid">
                                  <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isSubmittingPassword}
                                  >
                                    {isSubmittingPassword ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Changing Password...
                                      </>
                                    ) : 'Change Password'}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// MyBookingsContent component for displaying user bookings
const MyBookingsContent = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth(); // IMPORTANT: Use the same context as the parent component
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Define fetchBookings function that checks for user token
  const fetchBookings = async () => {
    // Don't proceed if no user or token
    if (!user || !user.token) {
      console.log("No user or token available yet, skipping fetch");
      setError("Authentication required. Please try again.");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching bookings with token:", user.token);
      
      const response = await fetch(`http://localhost:8000/api/user/bookings`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      console.log("Bookings API response:", data);
      
      // Handle different response formats
      if (data.data) {
        setBookings(data.data);
      } else if (data.bookings) {
        setBookings(data.bookings);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Unexpected bookings response format:", data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Only call fetchBookings when the component mounts AND user is available with token
  useEffect(() => {
    if (user && user.token) {
      console.log("User and token available, fetching bookings");
      fetchBookings();
    } else {
      console.log("Waiting for user data and token");
      setIsLoading(false);
    }
  }, [user]); // Only depend on user, not user?.token
  
  // Helper function for status badge
  const getStatusBadge = (status) => {
    let variant = 'secondary';
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'confirmed':
        variant = 'success';
        break;
      case 'cancelled':
        variant = 'danger';
        break;
      case 'completed':
        variant = 'info';
        break;
      default:
        variant = 'secondary';
    }
    return <span className={`badge bg-${variant}`}>{status}</span>;
  };
  
  // Helper function for payment status badge
  const getPaymentBadge = (status) => {
    let variant = 'secondary';
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'paid':
        variant = 'success';
        break;
      case 'refunded':
        variant = 'info';
        break;
      case 'failed':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <span className={`badge bg-${variant}`}>{status}</span>;
  };
  
  // If user data is not available yet, show a waiting message
  if (!user || !user.token) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Preparing your booking information...</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-3">
        <button 
          className="btn btn-outline-primary" 
          onClick={fetchBookings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Loading...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </>
          )}
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center my-5">
          <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <h4 className="mt-3">No Bookings Found</h4>
          <p className="text-muted">You don't have any bookings yet.</p>
          <button onClick={() => navigate('/cars')} className="btn btn-primary mt-2">Browse Cars</button>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map(booking => (
            <div className="card mb-4 shadow-sm" key={booking.id}>
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Booking #{booking.id}</h5>
                <div>
                  {getStatusBadge(booking.status)}
                  {' '}
                  {getPaymentBadge(booking.payment_status)}
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3 mb-md-0">
                    {booking.car?.image ? (
                      <img 
                        src={`http://localhost:8000/${booking.car.image}`}
                        alt={booking.car?.name} 
                        className="img-fluid rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=Car';
                        }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{height: '150px'}}>
                        <i className="bi bi-car-front fs-1 text-secondary"></i>
                      </div>
                    )}
                  </div>
                  <div className="col-md-5">
                    <h5>{booking.car?.name || 'Car details unavailable'}</h5>
                    <p className="text-muted mb-2">
                      {booking.car?.brand?.name && `${booking.car.brand.name} • `}
                      {booking.car?.category?.name}
                    </p>
                    
                    <div className="mb-2">
                      <i className="bi bi-calendar3 me-2"></i>
                      <strong>Pickup:</strong> {new Date(booking.pickup_date).toLocaleDateString()}
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-calendar3-fill me-2"></i>
                      <strong>Return:</strong> {new Date(booking.return_date).toLocaleDateString()}
                    </div>
                    <div className="mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      <strong>Location:</strong> {booking.pickup_location}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <h6 className="card-title">Booking Details</h6>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Subtotal:</span>
                          <span>${parseFloat(booking.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span>Tax:</span>
                          <span>${parseFloat(booking.tax_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total:</span>
                          <span>${parseFloat(booking.total_price || 0).toFixed(2)}</span>
                        </div>
                        
                        <div className="d-flex flex-column mt-3 gap-2">
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => navigate(`/checkout/${booking.id}`)} 
                              className="btn btn-primary btn-sm"
                            >
                              Complete Payment
                            </button>
                          )}
                          
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to cancel this booking?")) {
                                  try {
                                    const response = await fetch(`http://localhost:8000/api/bookings/${booking.id}/cancel`, {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${user.token}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({ reason: 'Customer cancellation' })
                                    });
                                    
                                    if (response.ok) {
                                      toast.success("Booking cancelled successfully");
                                      fetchBookings(); // Refresh the bookings list
                                    } else {
                                      toast.error("Failed to cancel booking");
                                    }
                                  } catch (error) {
                                    console.error("Error cancelling booking:", error);
                                    toast.error("Error processing your request");
                                  }
                                }
                              }}
                            >
                              Cancel Booking
                            </button>
                          )}
                          
                          <button 
  className="btn btn-outline-secondary btn-sm"
  onClick={() => {
    // Print receipt functionality - improved compact version based on admin receipt
    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt #${booking.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 15px;
                color: #333;
                font-size: 12px;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 15px;
              }
              .header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
              }
              .header h1 {
                margin: 0 0 5px 0;
                font-size: 20px;
              }
              .header p {
                margin: 2px 0;
                font-size: 12px;
              }
              .title {
                text-align: center;
                margin-bottom: 15px;
              }
              .title h2 {
                margin: 0 0 5px 0;
                font-size: 16px;
              }
              h1, h2, h3 {
                color: #444;
              }
              .section {
                margin-bottom: 12px;
              }
              .section h3 {
                border-bottom: 1px solid #ddd;
                padding-bottom: 4px;
                margin: 0 0 8px 0;
                font-size: 14px;
              }
              .two-columns {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
              }
              .column {
                width: 48%;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              td {
                padding: 4px 0;
                vertical-align: top;
              }
              .label {
                width: 40%;
                font-weight: bold;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                font-style: italic;
                color: #555;
                font-size: 11px;
              }
              .footer p {
                margin: 2px 0;
              }
              @media print {
                .receipt {
                  border: none;
                }
                .no-print { 
                  display: none; 
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <!-- Company Header -->
              <div class="header">
                <h1>Car Rental System</h1>
                <p>123 Main Street, Phnom Penh, Cambodia</p>
                <p>Phone: (123) 456-7890 | Email: info@carrentals.com</p>
              </div>
              
              <!-- Receipt Title -->
              <div class="title">
                <h2>BOOKING RECEIPT #${booking.id}</h2>
                <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="two-columns">
                <!-- Left Column: Booking & Customer Details -->
                <div class="column">
                  <!-- Booking Information -->
                  <div class="section">
                    <h3>Booking Information</h3>
                    <table>
                      <tr>
                        <td class="label">Status:</td>
                        <td>${booking.status.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td class="label">Pickup Date:</td>
                        <td>${new Date(booking.pickup_date).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td class="label">Return Date:</td>
                        <td>${new Date(booking.return_date).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td class="label">Duration:</td>
                        <td>${Math.ceil(Math.abs(new Date(booking.return_date) - new Date(booking.pickup_date)) / (1000 * 60 * 60 * 24) + 1)} days</td>
                      </tr>
                      <tr>
                        <td class="label">Pickup Location:</td>
                        <td>${booking.pickup_location || 'Main Office'}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Customer Information -->
                  <div class="section">
                    <h3>Customer Information</h3>
                    <table>
                      <tr>
                        <td class="label">Name:</td>
                        <td>${booking.customer_name}</td>
                      </tr>
                      <tr>
                        <td class="label">Email:</td>
                        <td>${booking.customer_email}</td>
                      </tr>
                      <tr>
                        <td class="label">Phone:</td>
                        <td>${booking.customer_phone || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>
                </div>
                
                <!-- Right Column: Car & Payment -->
                <div class="column">
                  <!-- Car Information -->
                  <div class="section">
                    <h3>Car Information</h3>
                    <table>
                      <tr>
                        <td class="label">Car:</td>
                        <td>${booking.car?.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td class="label">Brand/Model:</td>
                        <td>${booking.car?.brand?.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td class="label">Category:</td>
                        <td>${booking.car?.category?.name || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Payment Information -->
                  <div class="section">
                    <h3>Payment Information</h3>
                    <table>
                      <tr>
                        <td class="label">Daily Rate:</td>
                        <td>$${parseFloat(booking.car?.price || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Subtotal:</td>
                        <td>$${parseFloat(booking.subtotal || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Tax:</td>
                        <td>$${parseFloat(booking.tax_amount || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Total:</td>
                        <td style="font-weight: bold;">$${parseFloat(booking.total_price || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td class="label">Payment Status:</td>
                        <td>${booking.payment_status?.toUpperCase() || 'PENDING'}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
              
              <!-- Terms and Conditions -->
              <div class="section">
                <h3>Terms & Conditions</h3>
                <p style="font-size: 10px; margin: 4px 0;">
                  1. The vehicle must be returned in the same condition as when received.
                  2. Full payment is due at time of rental unless otherwise arranged.
                  3. Additional charges may apply for late returns, damage, or excessive mileage.
                  4. Cancellation within 24 hours of pickup time may incur a cancellation fee.
                </p>
              </div>
              
              <!-- Thank You Note -->
              <div class="footer">
                <p>Thank you for choosing our Car Rental Service!</p>
                <p>For questions or assistance, please contact us at (123) 456-7890.</p>
              </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for resources to load then print
      setTimeout(() => {
        printWindow.focus();
        // On some browsers direct print() might be blocked, so show print dialog instead
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Error printing receipt');
    }
  }}
>
  <i className="bi bi-printer me-1"></i> Print Receipt
</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Profile;