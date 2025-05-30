import React, { useState, useEffect, useRef } from 'react'; // Make sure useRef is imported
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const CarsDashboard = () => {
  const navigate = useNavigate();
  const { admin, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add this new state for brand form
  const [newBrand, setNewBrand] = useState({
    name: '',
    status: 1,
    logo: null
  });
  
  const [filters, setFilters] = useState({
  search: '',
  brand_id: '',
  category_id: '',
  status: ''
  });

// Add this to handle filtered cars
  const [filteredCars, setFilteredCars] = useState([]);

  
  // Add this state for category form
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    status: 1
  });

  // Add this new state for car form
  const [newCar, setNewCar] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    year: new Date().getFullYear(),
    price: '',
    status: 'available',
    description: '',
    fuel_type: '',
    transmission: '',
    mileage: '',
    condition: 'New',
    featured: false, // Add this line
    image: null
  });
  
  // Add this for modal handling
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  // Add these refs - this is what's missing!
  const fileInputRef = useRef(null);
  const carImageInputRef = useRef(null);

  // Fetch cars, brands, and categories from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!admin?.token) {
          toast.error('Authentication required');
          return;
        }
        
        // Add debug logging
        console.log('Fetching data with token:', admin.token);
        
        // Fetch brands from API
        const brandsResponse = await fetch('http://localhost:8000/api/brands', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        // Log the raw response
        console.log('Brands response status:', brandsResponse.status);
        
        if (!brandsResponse.ok) {
          throw new Error('Failed to fetch brands');
        }
        
        const brandsResult = await brandsResponse.json();
        
        // Log the actual data structure
        console.log('Brands API result:', brandsResult);
        console.log('Brands data array:', brandsResult.data);
        
        // Make sure we're handling null data safely
        setBrands(brandsResult.data || []);
        
        // Fetch categories from API
        const categoriesResponse = await fetch('http://localhost:8000/api/categories', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.data || []);
        
        // Fetch cars from API
        const carsResponse = await fetch('http://localhost:8000/api/cars', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!carsResponse.ok) {
          throw new Error('Failed to fetch cars');
        }
        
        const carsResult = await carsResponse.json();
        setCars(carsResult.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [admin, activeTab]); // Add activeTab here
  
  // Handle category form input change
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle brand form input change
  const handleBrandChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      setNewBrand(prev => ({
        ...prev,
        logo: files[0]
      }));
    } else {
      setNewBrand(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle car form input change
  const handleCarChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setNewCar(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setNewCar(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle add category submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          status: newCategory.status
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Category added successfully');
        // Reset form
        setNewCategory({
          name: '',
          description: '',
          status: 1
        });
        // Refresh categories list
        const categoriesResponse = await fetch('http://localhost:8000/api/categories', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.data || []);
      } else {
        toast.error(result.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  // Handle delete category
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/categories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (response.ok) {
          toast.success('Category deleted successfully');
          // Remove from state
          setCategories(prev => prev.filter(cat => cat.id !== id));
        } else {
          const result = await response.json();
          toast.error(result.message || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('An error occurred while deleting the category');
      }
    }
  };
  
  // Handle add brand submission
  const handleAddBrand = async (e) => {
    e.preventDefault();
    
    if (!newBrand.name.trim()) {
      toast.error('Brand name is required');
      return;
    }
    
    try {
      // Create form data object for file upload
      const formData = new FormData();
      formData.append('name', newBrand.name);
      formData.append('status', newBrand.status);
      
      // Only append logo if it exists
      if (newBrand.logo) {
        formData.append('logo', newBrand.logo);
      }
      
      const response = await fetch('http://localhost:8000/api/brands', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${admin.token}`
        },
        body: formData // Use FormData instead of JSON.stringify
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Brand added successfully');
        // Reset form
        setNewBrand({
          name: '',
          status: 1,
          logo: null
        });
        
        // Reset file input (you need a ref)
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Refresh brands list
        const brandsResponse = await fetch('http://localhost:8000/api/brands', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        const brandsResult = await brandsResponse.json();
        setBrands(brandsResult.data || []);
      } else {
        toast.error(result.message || 'Failed to add brand');
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  // Handle delete brand
  const handleDeleteBrand = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/brands/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (response.ok) {
          toast.success('Brand deleted successfully');
          // Remove from state
          setBrands(prev => prev.filter(brand => brand.id !== id));
        } else {
          const result = await response.json();
          toast.error(result.message || 'Failed to delete brand');
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        toast.error('An error occurred while deleting the brand');
      }
    }
  };
  
  // Handle add car submission
  const handleAddCar = async (e) => {
    e.preventDefault();
    
    if (!newCar.name.trim()) {
      toast.error('Car name is required');
      return;
    }
    
    try {
      // Create form data object for file upload
      const formData = new FormData();
      formData.append('name', newCar.name);
      formData.append('brand_id', newCar.brand_id);
      formData.append('category_id', newCar.category_id);
      formData.append('year', newCar.year);
      formData.append('price', newCar.price);
      formData.append('status', newCar.status);
      formData.append('description', newCar.description);
      formData.append('fuel_type', newCar.fuel_type);
      formData.append('transmission', newCar.transmission);
      formData.append('mileage', newCar.mileage);
      formData.append('condition', newCar.condition);
      
      // Only append image if it exists
      if (newCar.image) {
        formData.append('image', newCar.image);
      }
      
      // Add this to the formData section in the handleAddCar function:
      formData.append('featured', newCar.featured ? 1 : 0);
      
      const response = await fetch('http://localhost:8000/api/cars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${admin.token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Car added successfully');
        // Reset form
        setNewCar({
          name: '',
          brand_id: '',
          category_id: '',
          year: new Date().getFullYear(),
          price: '',
          status: 'available',
          description: '',
          fuel_type: '',
          transmission: '',
          mileage: '',
          condition: 'New',
          featured: false, // Reset featured state
          image: null
        });
        
        // Reset file input
        if (carImageInputRef.current) {
          carImageInputRef.current.value = "";
        }
        
        // Close modal
        setShowAddCarModal(false);
        
        // Refresh cars list
        const carsResponse = await fetch('http://localhost:8000/api/cars', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        const carsResult = await carsResponse.json();
        setCars(carsResult.data || []);
      } else {
        toast.error(result.message || 'Failed to add car');
      }
    } catch (error) {
      console.error('Error adding car:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  // Handle delete car
  const handleDeleteCar = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/cars/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (response.ok) {
          toast.success('Car deleted successfully');
          // Remove from state
          setCars(prev => prev.filter(car => car.id !== id));
        } else {
          const result = await response.json();
          toast.error(result.message || 'Failed to delete car');
        }
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('An error occurred while deleting the car');
      }
    }
  };
  
  // Helper function for status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'info';
      case 'maintenance':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (authLoading || isLoading) {
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
            <h1 className="h3 mb-0">Cars Management</h1>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-file-earmark-text me-1"></i> Export List
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowAddCarModal(true)}
              >
                <i className="bi bi-plus-lg me-1"></i> Add New Car
              </button>
            </div>
          </div>
          
          {/* Tabs for Cars, Brands, Categories */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'cars' ? 'active' : ''}`}
                onClick={() => setActiveTab('cars')}
              >
                <i className="bi bi-car-front me-1"></i> Cars
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'brands' ? 'active' : ''}`}
                onClick={() => setActiveTab('brands')}
              >
                <i className="bi bi-tag me-1"></i> Brands
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <i className="bi bi-grid me-1"></i> Categories
              </button>
            </li>
          </ul>
          
          {/* Cars Tab Content */}
          {activeTab === 'cars' && (
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Image</th>
                        <th scope="col">Name</th>
                        <th scope="col">Brand</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price/Day</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.length > 0 ? (
                        cars.map(car => (
                          <tr key={car.id}>
                            <td>#{car.id}</td>
                            <td>
                              {car.image ? (
                                <img 
                                  src={`http://localhost:8000/${car.image}`}
                                  alt={car.name} 
                                  className="img-thumbnail" 
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                />
                              ) : (
                                <div 
                                  className="bg-light d-flex align-items-center justify-content-center rounded" 
                                  style={{ width: '60px', height: '60px' }}
                                >
                                  <i className="bi bi-car-front text-secondary"></i>
                                </div>
                              )}
                            </td>
                            <td>{car.name}</td>
                            <td>{typeof car.brand === 'object' ? car.brand?.name : car.brand || 'No Brand'}</td>
                            <td>{typeof car.category === 'object' ? car.category?.name : car.category || 'No Category'}</td>
                            <td>${parseFloat(car.price).toFixed(2)}</td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(car.status)}`}>
                                {car.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => navigate(`/admin/cars/${car.id}`)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => navigate(`/admin/cars/edit/${car.id}`)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteCar(car.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-3">No cars found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Brands Tab Content */}
          {activeTab === 'brands' && (
            <div className="row g-4">
              <div className="col-md-8">
                <div className="card shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Logo</th>
                            <th scope="col">Brand Name</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.length > 0 ? (
                            brands.map(brand => (
                              <tr key={brand.id}>
                                <td>#{brand.id}</td>
                                <td>
                                  {brand.logo ? (
                                    <img 
                                      src={`http://localhost:8000/${brand.logo}`} 
                                      alt={brand.name} 
                                      className="img-thumbnail" 
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                    />
                                  ) : (
                                    <div 
                                      className="bg-light d-flex align-items-center justify-content-center rounded" 
                                      style={{ width: '40px', height: '40px' }}
                                    >
                                      <i className="bi bi-image text-secondary"></i>
                                    </div>
                                  )}
                                </td>
                                <td>{brand.name}</td>
                                <td>
                                  <span className={`badge bg-${brand.status == 1 ? 'success' : 'secondary'}`}>
                                    {brand.status == 1 ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-secondary me-1"
                                    onClick={() => navigate(`/admin/brands/edit/${brand.id}`)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteBrand(brand.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-3">No brands found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Add New Brand</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddBrand}>
                      <div className="mb-3">
                        <label htmlFor="brandName" className="form-label">Brand Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="brandName" 
                          name="name"
                          value={newBrand.name}
                          onChange={handleBrandChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="brandLogo" className="form-label">Brand Logo</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          id="brandLogo" 
                          name="logo"
                          onChange={handleBrandChange}
                          accept="image/*"
                          ref={fileInputRef}
                        />
                        <div className="form-text">Upload a square logo image (max 2MB)</div>
                        
                        {newBrand.logo && (
                          <div className="mt-2">
                            <img 
                              src={newBrand.logo instanceof File ? URL.createObjectURL(newBrand.logo) : newBrand.logo}
                              alt="Preview" 
                              className="img-thumbnail" 
                              style={{ height: "100px" }} 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <div>
                          <div className="form-check form-check-inline">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="brandStatusActive" 
                              value="1"
                              checked={newBrand.status == 1}
                              onChange={handleBrandChange}
                            />
                            <label className="form-check-label" htmlFor="brandStatusActive">
                              Active
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="brandStatusInactive" 
                              value="0"
                              checked={newBrand.status == 0}
                              onChange={handleBrandChange}
                            />
                            <label className="form-check-label" htmlFor="brandStatusInactive">
                              Inactive
                            </label>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary w-100">Add Brand</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Categories Tab Content */}
          {activeTab === 'categories' && (
            <div className="row g-4">
              <div className="col-md-8">
                <div className="card shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Category Name</th>
                            <th scope="col">Description</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.length > 0 ? (
                            categories.map(category => (
                              <tr key={category.id}>
                                <td>#{category.id}</td>
                                <td>{category.name}</td>
                                <td>{category.description || 'N/A'}</td>
                                <td>
                                  <span className={`badge bg-${category.status == 1 ? 'success' : 'secondary'}`}>
                                    {category.status == 1 ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-secondary me-1"
                                    onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCategory(category.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-3">No categories found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Add New Category</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddCategory}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Category Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="name" 
                          name="name"
                          value={newCategory.name}
                          onChange={handleCategoryChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea 
                          className="form-control" 
                          id="description" 
                          name="description"
                          value={newCategory.description}
                          onChange={handleCategoryChange}
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <div>
                          <div className="form-check form-check-inline">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="statusActive" 
                              value="1"
                              checked={newCategory.status === 1 || newCategory.status === "1"}
                              onChange={handleCategoryChange}
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
                              checked={newCategory.status === 0 || newCategory.status === "0"}
                              onChange={handleCategoryChange}
                            />
                            <label className="form-check-label" htmlFor="statusInactive">
                              Inactive
                            </label>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary w-100">Add Category</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Car Modal */}
      <div className={`modal fade ${showAddCarModal ? 'show' : ''}`} id="addCarModal" tabIndex="-1" style={{ display: showAddCarModal ? 'block' : 'none' }} aria-labelledby="addCarModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addCarModalLabel">Add New Car</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddCarModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddCar}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="carName" className="form-label">Car Name*</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="carName" 
                      name="name"
                      value={newCar.name}
                      onChange={handleCarChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="carYear" className="form-label">Year*</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="carYear" 
                      name="year"
                      value={newCar.year}
                      onChange={handleCarChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="carBrand" className="form-label">Brand*</label>
                    <select 
                      className="form-select" 
                      id="carBrand" 
                      name="brand_id"
                      value={newCar.brand_id}
                      onChange={handleCarChange}
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.filter(brand => brand.status == 1).map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="carCategory" className="form-label">Category*</label>
                    <select 
                      className="form-select" 
                      id="carCategory" 
                      name="category_id"
                      value={newCar.category_id}
                      onChange={handleCarChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.filter(category => category.status == 1).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="carPrice" className="form-label">Price Per Day ($)*</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="carPrice" 
                      name="price"
                      value={newCar.price}
                      onChange={handleCarChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="carCondition" className="form-label">Condition*</label>
                    <select 
                      className="form-select" 
                      id="carCondition" 
                      name="condition"
                      value={newCar.condition}
                      onChange={handleCarChange}
                      required
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="carFuelType" className="form-label">Fuel Type</label>
                    <select 
                      className="form-select" 
                      id="carFuelType" 
                      name="fuel_type"
                      value={newCar.fuel_type}
                      onChange={handleCarChange}
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
                    <label htmlFor="carTransmission" className="form-label">Transmission</label>
                    <select 
                      className="form-select" 
                      id="carTransmission" 
                      name="transmission"
                      value={newCar.transmission}
                      onChange={handleCarChange}
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
                    <label htmlFor="carMileage" className="form-label">Mileage</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="carMileage" 
                      name="mileage"
                      value={newCar.mileage}
                      onChange={handleCarChange}
                      placeholder="e.g., 5,000 miles"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="carStatus" className="form-label">Status*</label>
                    <select 
                      className="form-select" 
                      id="carStatus" 
                      name="status"
                      value={newCar.status}
                      onChange={handleCarChange}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="carDescription" className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    id="carDescription" 
                    name="description"
                    value={newCar.description}
                    onChange={handleCarChange}
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="carImage" className="form-label">Car Image</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="carImage" 
                    name="image"
                    onChange={handleCarChange}
                    accept="image/*"
                    ref={carImageInputRef}
                  />
                  <div className="form-text">Upload a high-quality image of the car (max 2MB)</div>
                  
                  {newCar.image && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(newCar.image)}
                        alt="Preview" 
                        className="img-thumbnail" 
                        style={{ height: "150px" }} 
                      />
                    </div>
                  )}
                </div>
                
                {/* Featured Car Checkbox */}
                <div className="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="carFeatured" 
                    name="featured"
                    checked={newCar.featured}
                    onChange={(e) => setNewCar({...newCar, featured: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="carFeatured">
                    Mark as Featured Car (will be displayed on homepage)
                  </label>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddCarModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Add Car
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for modal */}
      {showAddCarModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default CarsDashboard;