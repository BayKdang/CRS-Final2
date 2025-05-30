import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [category, setCategory] = useState({
    name: '',
    description: '',
    status: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        // Get the token from admin auth context
        const token = admin?.token;
        
        if (!token) {
          toast.error('Authentication required');
          navigate('/admin/login');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/categories/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setCategory(result.data);
        } else {
          toast.error(result.message || 'Failed to load category');
          navigate('/admin/cars');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('An error occurred while loading category');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [id, admin, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      const response = await fetch(`http://localhost:8000/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(category)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Category updated successfully');
        
        // Option 1: force a refresh by setting state (if using state management)
        // updateCategories(prevCategories => prevCategories.map(cat => 
        //   cat.id === id ? {...cat, ...category} : cat
        // ));
        
        // Option 2: Navigate back to refresh the page
        navigate('/admin/cars');
      } else {
        toast.error(result.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('An error occurred while updating category');
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
            <h1 className="h3 mb-0">Edit Category</h1>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/cars')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Categories
            </button>
          </div>
          
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Category Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        value={category.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        id="description" 
                        name="description"
                        value={category.description || ''}
                        onChange={handleChange}
                        rows="3"
                      ></textarea>
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
                            checked={category.status === 1 || category.status === "1"}
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
                            checked={category.status === 0 || category.status === "0"} 
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

export default CategoryEdit;