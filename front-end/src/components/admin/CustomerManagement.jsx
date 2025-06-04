import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const { admin, isLoading: authLoading } = useAdminAuth();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customersPerPage] = useState(10);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!admin?.token) {
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/api/admin/customers?page=${currentPage}&search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const result = await response.json();
        setCustomers(result.data || []);
        
        // Calculate total pages
        if (result.meta) {
          setTotalPages(Math.ceil(result.meta.total / result.meta.per_page));
        } else if (result.total && result.per_page) {
          setTotalPages(Math.ceil(result.total / result.per_page));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [admin, currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // View customer details
  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const result = await response.json();
      const customer = result.data;
      
      // Display customer details in modal or dialog
      toast.info(`Viewing details for ${customer.name}`);
      
      // For now, just show an alert with the details (you can replace this with a modal)
      return customer;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details');
      return null;
    }
  };

  // Show customer details modal
  const showCustomerDetailsModal = async (customerId) => {
    const customer = await viewCustomerDetails(customerId);
    if (!customer) return;
    
    // Format registration date
    const registeredDate = new Date(customer.created_at).toLocaleDateString();
    
    // Create a formatted content string with customer information
    const detailsContent = `
      <div class="customer-details">
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
        <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
        <p><strong>Registered:</strong> ${registeredDate}</p>
        <p><strong>Total Bookings:</strong> ${customer.bookings_count || 0}</p>
      </div>
    `;
    
    // Use SweetAlert or similar library to show the modal
    // Here, we're using a simple custom alert for demonstration
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
      <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Customer Details: ${customer.name}</h5>
              <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
            </div>
            <div class="modal-body">
              ${detailsContent}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);
  };

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            <h1 className="h3 mb-0">Customer Management</h1>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-file-earmark-text me-1"></i> Export List
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch} className="row g-3 align-items-end">
                <div className="col-md-4">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search by name or email" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-auto ms-auto">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Reset Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Customers table */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration Date</th>
                      <th>Bookings</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map(customer => (
                        <tr key={customer.id}>
                          <td>#{customer.id}</td>
                          <td>{customer.name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone || 'N/A'}</td>
                          <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                          <td>{customer.bookings_count || 0}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => showCustomerDetailsModal(customer.id)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => navigate(`/admin/bookings?customer_id=${customer.id}`)}
                              title="View Bookings"
                            >
                              <i className="bi bi-calendar-check"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No customers found. Adjust filters or add new customers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer bg-white">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {/* Generate page numbers */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show limited page numbers for better UI
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <li 
                            key={pageNumber} 
                            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <li key={pageNumber} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;