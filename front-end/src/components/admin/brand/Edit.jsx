import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

const BrandEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [brand, setBrand] = useState({
    name: '',
    status: 1,
    logo: null
  });
  const [newLogo, setNewLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  // Fetch brand data
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setIsLoading(true);
        const token = admin?.token;
        
        if (!token) {
          toast.error('Authentication required');
          navigate('/admin/login');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/brands/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setBrand(result.data);
        } else {
          toast.error(result.message || 'Failed to load brand');
          navigate('/admin/cars');
        }
      } catch (error) {
        console.error('Error fetching brand:', error);
        toast.error('An error occurred while loading brand');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBrand();
  }, [id, admin, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'logo' && files && files[0]) {
      setNewLogo(files[0]);
    } else {
      setBrand(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const token = admin?.token;
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/admin/login');
        return;
      }
      
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', brand.name);
      formData.append('status', brand.status);
      
      // Only include new logo if one was selected
      if (newLogo) {
        formData.append('logo', newLogo);
      }
      
      // Add _method field for Laravel to recognize this as PUT request
      formData.append('_method', 'PUT');
      
      const response = await fetch(`http://localhost:8000/api/brands/${id}`, {
        method: 'POST', // Use POST with _method=PUT for FormData
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Brand updated successfully');
        navigate('/admin/cars');
      } else {
        toast.error(result.message || 'Failed to update brand');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('An error occurred while updating brand');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      
      <div className="flex-grow-1">
        <AdminHeader adminName={admin?.name || 'Admin'} />
        
        <div className="container-fluid py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Edit Brand</h1>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/cars')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Brands
            </button>
          </div>
          
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Brand Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        value={brand.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="logo" className="form-label">Brand Logo</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="logo" 
                        name="logo"
                        onChange={handleChange}
                        accept="image/*"
                        ref={fileInputRef}
                      />
                      <div className="form-text">Upload a square logo image (max 2MB)</div>
                      
                      {/* Show current logo or preview of new logo */}
                      {(brand.logo || newLogo) && (
                        <div className="mt-2">
                          {newLogo ? (
                            <div>
                              <p className="mb-1">New logo preview:</p>
                              <img 
                                src={URL.createObjectURL(newLogo)} 
                                alt="New Logo Preview" 
                                className="img-thumbnail" 
                                style={{ height: "100px" }} 
                              />
                            </div>
                          ) : brand.logo && (
                            <div>
                              <p className="mb-1">Current logo:</p>
                              <img 
                                src={`http://localhost:8000/${brand.logo}`} 
                                alt="Current Logo" 
                                className="img-thumbnail" 
                                style={{ height: "100px" }} 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">Status</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="status" 
                            id="statusActive" 
                            value="1"
                            checked={brand.status == 1}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="statusActive">
                            Active
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="status" 
                            id="statusInactive" 
                            value="0"
                            checked={brand.status == 0} 
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="statusInactive">
                            Inactive
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-grid gap-2 d-flex justify-content-end">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/admin/cars')}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandEdit;