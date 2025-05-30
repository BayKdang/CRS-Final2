import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { apiUrl } from '../../../components/common/http';

const CarEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [car, setCar] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    year: '',
    price: '',
    status: 'available',
    description: '',
    fuel_type: '',
    transmission: '',
    mileage: '',
    condition: 'New',
    image: null,
    featured: false
  });
  const [newImage, setNewImage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const imageInputRef = useRef(null);

  // Fetch car data and dependent data (brands, categories)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = admin?.token;
        
        if (!token) {
          toast.error('Authentication required');
          navigate('/admin/login');
          return;
        }

        // Fetch car details
        const carResponse = await fetch(`${apiUrl}/cars/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!carResponse.ok) {
          throw new Error('Failed to fetch car details');
        }
        
        const carResult = await carResponse.json();
        setCar(carResult.data);
        
        // Fetch brands
        const brandsResponse = await fetch(`${apiUrl}/brands`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!brandsResponse.ok) {
          throw new Error('Failed to fetch brands');
        }
        
        const brandsResult = await brandsResponse.json();
        setBrands(brandsResult.data || []);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${apiUrl}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, admin, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setNewImage(files[0]);
    } else {
      setCar(prev => ({
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
      formData.append('name', car.name);
      formData.append('brand_id', car.brand_id);
      formData.append('category_id', car.category_id);
      formData.append('year', car.year);
      formData.append('price', car.price);
      formData.append('status', car.status);
      formData.append('description', car.description || '');
      formData.append('fuel_type', car.fuel_type || '');
      formData.append('transmission', car.transmission || '');
      formData.append('mileage', car.mileage || '');
      formData.append('condition', car.condition);
      formData.append('featured', car.featured ? 1 : 0); // Add this line
      
      // Only include new image if one was selected
      if (newImage) {
        formData.append('image', newImage);
      }
      
      // Add _method field for Laravel to recognize this as PUT request
      formData.append('_method', 'PUT');
      
      const response = await fetch(`${apiUrl}/cars/${id}`, {
        method: 'POST', // Use POST with _method=PUT for FormData
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Car updated successfully');
        navigate('/admin/cars');
      } else {
        toast.error(result.message || 'Failed to update car');
      }
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('An error occurred while updating car');
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
            <h1 className="h3 mb-0">Edit Car</h1>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/cars')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Cars
            </button>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Car Name*</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      name="name"
                      value={car.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="year" className="form-label">Year*</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="year" 
                      name="year"
                      value={car.year}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="brand_id" className="form-label">Brand*</label>
                    <select 
                      className="form-select" 
                      id="brand_id" 
                      name="brand_id"
                      value={car.brand_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="category_id" className="form-label">Category*</label>
                    <select 
                      className="form-select" 
                      id="category_id" 
                      name="category_id"
                      value={car.category_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="price" className="form-label">Price Per Day ($)*</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="price" 
                      name="price"
                      value={car.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="condition" className="form-label">Condition*</label>
                    <select 
                      className="form-select" 
                      id="condition" 
                      name="condition"
                      value={car.condition}
                      onChange={handleChange}
                      required
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="fuel_type" className="form-label">Fuel Type</label>
                    <select 
                      className="form-select" 
                      id="fuel_type" 
                      name="fuel_type"
                      value={car.fuel_type || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="transmission" className="form-label">Transmission</label>
                    <select 
                      className="form-select" 
                      id="transmission" 
                      name="transmission"
                      value={car.transmission || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="mileage" className="form-label">Mileage</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="mileage" 
                      name="mileage"
                      value={car.mileage || ''}
                      onChange={handleChange}
                      placeholder="e.g., 5,000 miles"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">Status*</label>
                    <select 
                      className="form-select" 
                      id="status" 
                      name="status"
                      value={car.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    id="description" 
                    name="description"
                    value={car.description || ''}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="featured" 
                    name="featured"
                    checked={car.featured}
                    onChange={(e) => setCar({...car, featured: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="featured">
                    Mark as Featured Car (will be displayed on homepage)
                  </label>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="image" className="form-label">Car Image</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="image" 
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    ref={imageInputRef}
                  />
                  <div className="form-text">Upload a high-quality image of the car (max 2MB)</div>
                  
                  <div className="mt-2">
                    {newImage ? (
                      <div>
                        <p className="mb-1">New image preview:</p>
                        <img 
                          src={URL.createObjectURL(newImage)} 
                          alt="New Image Preview" 
                          className="img-thumbnail" 
                          style={{ height: "150px" }} 
                        />
                      </div>
                    ) : car.image && (
                      <div>
                        <p className="mb-1">Current image:</p>
                        <img 
                          src={`http://localhost:8000/${car.image}`} 
                          alt="Current Image" 
                          className="img-thumbnail" 
                          style={{ height: "150px" }} 
                        />
                      </div>
                    )}
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
  );
};

export default CarEdit;