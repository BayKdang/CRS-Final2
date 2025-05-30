import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CarCard from './CarCard';
import { apiUrl } from './http';

// Car search skeleton card
const CarSkeleton = () => {
  return (
    <div className="col-md-6 col-lg-3 mb-4">
      <div className="card h-100 shadow border-0 bg-light">
        <div className="bg-secondary placeholder-glow" style={{ height: "200px" }}></div>
        <div className="card-body placeholder-glow">
          <h5 className="card-title placeholder col-6"></h5>
          <p className="card-text placeholder col-8"></p>
          <div className="d-flex justify-content-between mt-3">
            <span className="placeholder col-4"></span>
            <span className="placeholder col-4"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef();
  
  // Ah nis filter states kom pas nhe nhai anh vai
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    brand_id: searchParams.get('brand_id') || '',
    category_id: searchParams.get('category_id') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    transmission: searchParams.get('transmission') || '',
    fuel_type: searchParams.get('fuel_type') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // ah nis fetch api all jab pi cars to brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch cars
        console.log('Fetching cars from:', `${apiUrl}/cars`);
        const carsResponse = await fetch(`${apiUrl}/cars`);
        
        if (!carsResponse.ok) {
          throw new Error(`Failed to fetch cars: ${carsResponse.status}`);
        }
        
        const carsData = await carsResponse.json();
        setCars(carsData.data || []);
        
        // Fetch brands with better error handling
        try {
          console.log('Fetching brands from:', `${apiUrl}/brands`);
          const brandsResponse = await fetch(`${apiUrl}/brands`);
          
          if (!brandsResponse.ok) {
            console.error(`Failed to fetch brands: ${brandsResponse.status}`);
            // Continue execution instead of throwing (soft fail)
          } else {
            const brandsData = await brandsResponse.json();
            setBrands(brandsData.data || []);
          }
        } catch (brandError) {
          console.error('Error fetching brands:', brandError);
          // Don't rethrow - just log the error
        }
        
        // Fetch categories with better error handling
        try {
          console.log('Fetching categories from:', `${apiUrl}/categories`);
          const categoriesResponse = await fetch(`${apiUrl}/categories`);
          
          if (!categoriesResponse.ok) {
            console.error(`Failed to fetch categories: ${categoriesResponse.status}`);
            // Continue execution instead of throwing (soft fail)
          } else {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData.data || []);
          }
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          // Don't rethrow - just log the error
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle searching
  const handleSearch = () => {
    // Create a new URLSearchParams object
    const newParams = new URLSearchParams(searchParams);
    
    // Set or remove the search query parameter
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    } else {
      newParams.delete('q');
    }
    
    // Update URL with the new params
    setSearchParams(newParams);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
  
  // Update filters state
  setFilters(prev => ({
    ...prev,
    [name]: value
  }));
  
  // Create a new URLSearchParams object
  const newParams = new URLSearchParams(searchParams);
  
  // Set or remove the filter parameter with the same name
  if (value) {
    newParams.set(name, value);  // This should use 'brand_id' not 'brand'
  } else {
    newParams.delete(name);
  }
  
  // Update URL with the new params
  setSearchParams(newParams);
};

  // Reset all filters
  const resetFilters = () => {
    // Reset filters state
    setFilters({
      brand_id: '',
      category_id: '',
      price_min: '',
      price_max: '',
      transmission: '',
      fuel_type: '',
    });
    
    // Create a new URLSearchParams with only the search query
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    }
    
    // Update URL with the new params
    setSearchParams(newParams);
  };

  // Handle suggestion click
  const handleSuggestionClick = (car) => {
    setSearchQuery(car.name);
    
    // Create a new URLSearchParams object
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', car.name);
    
    setSearchParams(newParams);
    setShowSuggestions(false);
  };

  // Handle key press - search on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter cars based on search query and other filters
  useEffect(() => {
    if (!cars.length) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      let results = [...cars];
      
      // Filter by search query
      const query = searchParams.get('q');
      if (query) {
        results = results.filter(car => 
          car.name.toLowerCase().includes(query.toLowerCase()) ||
          (car.brand && typeof car.brand === 'object' && car.brand.name.toLowerCase().includes(query.toLowerCase())) ||
          (car.category && typeof car.category === 'object' && car.category.name.toLowerCase().includes(query.toLowerCase())) ||
          (car.fuel_type && car.fuel_type.toLowerCase().includes(query.toLowerCase())) ||
          (car.transmission && car.transmission.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // Filter by brand
      const brandId = searchParams.get('brand_id');
      if (brandId) {
        results = results.filter(car => {
          if (typeof car.brand === 'object') {
            return car.brand?.id == brandId;
          } else {
            return car.brand_id == brandId;
          }
        });
      }
      
      // Filter by category
      const categoryId = searchParams.get('category_id');
      if (categoryId) {
        results = results.filter(car => {
          if (typeof car.category === 'object') {
            return car.category?.id == categoryId;
          } else {
            return car.category_id == categoryId;
          }
        });
      }
      
      // Filter by price range
      const minPrice = searchParams.get('price_min');
      if (minPrice) {
        results = results.filter(car => parseFloat(car.price) >= parseFloat(minPrice));
      }
      
      const maxPrice = searchParams.get('price_max');
      if (maxPrice) {
        results = results.filter(car => parseFloat(car.price) <= parseFloat(maxPrice));
      }
      
      // Filter by transmission
      const transmission = searchParams.get('transmission');
      if (transmission) {
        results = results.filter(car => car.transmission === transmission);
      }
      
      // Filter by fuel type
      const fuelType = searchParams.get('fuel_type');
      if (fuelType) {
        results = results.filter(car => car.fuel_type === fuelType);
      }
      
      setFilteredCars(results);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams, cars]);

  // Get suggestions for dropdown
  const suggestions = cars.filter(car => 
    searchQuery && car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (car.brand && typeof car.brand === 'object' && car.brand.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (car.category && typeof car.category === 'object' && car.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter stats
  const activeFiltersCount = Object.values(filters).filter(val => val !== '').length;
  const getUniqueValues = (property) => {
    const values = new Set();
    cars.forEach(car => {
      if (car[property]) {
        values.add(car[property]);
      }
    });
    return Array.from(values);
  };
  
  const transmissionOptions = getUniqueValues('transmission');
  const fuelTypeOptions = getUniqueValues('fuel_type');

  return (
    <>
      <div className="min-vh-100 d-flex flex-column">
        <div className="container py-5 mt-5 flex-grow-1">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h1 className="mb-4">Find Your Perfect Car</h1>
              <p className="lead text-muted mb-5">
                Search our extensive collection of high-quality rental vehicles
              </p>
              
              {/* Search bar with suggestions */}
              <div className="position-relative mb-4" ref={suggestionRef}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by make, model, or type..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="button"
                    onClick={handleSearch}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && searchQuery && (
                  <div className="position-absolute w-100 mt-1 shadow-sm border rounded bg-white z-3">
                    {suggestions.length > 0 ? (
                      suggestions.slice(0, 5).map((car) => (
                        <div
                          key={car.id}
                          className="p-2 border-bottom hover-bg-light cursor-pointer"
                          onClick={() => handleSuggestionClick(car)}
                          style={{ cursor: 'pointer' }}
                        >
                          {car.name} {car.brand && typeof car.brand === 'object' ? `(${car.brand.name})` : ''}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-muted fst-italic">
                        No matches found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Filter toggle button */}
              <div className="d-flex justify-content-center mb-4">
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel me-2"></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'} 
                  {activeFiltersCount > 0 && <span className="badge bg-primary ms-2">{activeFiltersCount}</span>}
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Section */}
          {showFilters && (
            <div className="card shadow-sm mb-5 animate__animated animate__fadeIn">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Filter Options</h5>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={resetFilters}
                >
                  <i className="bi bi-x-circle me-1"></i> Reset Filters
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Brand filter */}
                  <div className="col-lg-4 col-md-6">
                    <label htmlFor="brand_filter" className="form-label">Brand</label>
                    <select
                      id="brand_filter"
                      className="form-select"
                      name="brand_id"
                      value={filters.brand_id}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Category filter */}
                  <div className="col-lg-4 col-md-6">
                    <label htmlFor="category_filter" className="form-label">Category</label>
                    <select
                      id="category_filter"
                      className="form-select"
                      name="category_id"
                      value={filters.category_id}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Transmission filter */}
                  <div className="col-lg-4 col-md-6">
                    <label htmlFor="transmission_filter" className="form-label">Transmission</label>
                    <select
                      id="transmission_filter"
                      className="form-select"
                      name="transmission"
                      value={filters.transmission}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Transmission</option>
                      {transmissionOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Fuel type filter */}
                  <div className="col-lg-4 col-md-6">
                    <label htmlFor="fuel_filter" className="form-label">Fuel Type</label>
                    <select
                      id="fuel_filter"
                      className="form-select"
                      name="fuel_type"
                      value={filters.fuel_type}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Fuel Type</option>
                      {fuelTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price range filters */}
                  <div className="col-lg-2 col-md-6">
                    <label htmlFor="price_min" className="form-label">Min Price ($)</label>
                    <input
                      id="price_min"
                      type="number"
                      className="form-control"
                      name="price_min"
                      placeholder="Min"
                      min="0"
                      value={filters.price_min}
                      onChange={handleFilterChange}
                    />
                  </div>
                  
                  <div className="col-lg-2 col-md-6">
                    <label htmlFor="price_max" className="form-label">Max Price ($)</label>
                    <input
                      id="price_max"
                      type="number"
                      className="form-control"
                      name="price_max"
                      placeholder="Max"
                      min="0"
                      value={filters.price_max}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found
                  </span>
                  <span className="text-muted small">
                    {activeFiltersCount ? `${activeFiltersCount} active filter${activeFiltersCount !== 1 ? 's' : ''}` : 'No filters applied'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message if API call fails */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Results Grid with Loading State */}
          <div className="row">
            {isLoading ? (
              // Skeleton loading cards
              Array.from({ length: 8 }).map((_, index) => <CarSkeleton key={index} />)
            ) : filteredCars.length > 0 ? (
              // Car results
              filteredCars.map(car => (
                <div className="col-md-6 col-lg-3 mb-4" key={car.id}>
                  <CarCard car={car} />
                </div>
              ))
            ) : (
              // No results found
              <div className="col-12 text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-emoji-frown display-1 text-muted"></i>
                </div>
                <h3>No Cars Found</h3>
                <p className="text-muted">
                  Try adjusting your search terms or filters to find available cars.
                </p>
                {activeFiltersCount > 0 && (
                  <button 
                    className="btn btn-outline-primary mt-3"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Shop;