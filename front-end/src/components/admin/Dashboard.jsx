import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { getBookingStats } from '../../services/adminBookingService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { admin, isAuthenticated, isLoading } = useAdminAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    todayBookings: 0,
    thisMonthRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Get booking stats
        const statsData = await getBookingStats(admin.token);
        setStats(statsData.data);
        
        // Fetch recent bookings
        const bookingsResponse = await fetch('http://localhost:8000/api/admin/bookings?limit=5', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch recent bookings');
        }
        
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData.data.slice(0, 5)); // Take first 5 results
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    if (admin?.token) {
      fetchStats();
    }
  }, [admin]);
  
  // Print booking receipt function
  const printBookingReceipt = (bookingId) => {
    try {
      // Find the booking by ID
      const booking = recentBookings.find(b => b.id === bookingId) || recentBookings[0];
      if (!booking) {
        toast.error('Booking information not available');
        return;
      }
      
      const car = booking.car || {};
      const currentDate = new Date().toLocaleDateString();
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate receipt content
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt #${booking.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #ddd;
              }
              .title {
                text-align: center;
                margin-bottom: 20px;
              }
              h1, h2, h3 {
                color: #444;
              }
              .section {
                margin-bottom: 20px;
              }
              .section h3 {
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              td {
                padding: 8px 0;
              }
              .label {
                width: 150px;
                font-weight: bold;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-style: italic;
                color: #555;
              }
              @media print {
                .receipt {
                  border: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <!-- Company Header -->
              <div class="header">
                <h1>Car Rental System</h1>
                <p>123 Main Street, City, Country</p>
                <p>Phone: (123) 456-7890 | Email: info@carrentals.com</p>
              </div>
              
              <!-- Receipt Title -->
              <div class="title">
                <h2>BOOKING RECEIPT</h2>
                <p>Date: ${currentDate}</p>
              </div>
              
              <!-- Booking Details -->
              <div class="section">
                <h3>Booking Information</h3>
                <table>
                  <tr>
                    <td class="label">Booking ID:</td>
                    <td>#${booking.id}</td>
                  </tr>
                  <tr>
                    <td class="label">Date:</td>
                    <td>${formatDate(booking.created_at)}</td>
                  </tr>
                  <tr>
                    <td class="label">Status:</td>
                    <td>${booking.status.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td class="label">Pickup Date:</td>
                    <td>${formatDate(booking.pickup_date)}</td>
                  </tr>
                  <tr>
                    <td class="label">Return Date:</td>
                    <td>${formatDate(booking.return_date)}</td>
                  </tr>
                  <tr>
                    <td class="label">Location:</td>
                    <td>${booking.pickup_location || 'Main Office'}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Customer Details -->
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
              
              <!-- Car Details -->
              <div class="section">
                <h3>Car Information</h3>
                <table>
                  <tr>
                    <td class="label">Car:</td>
                    <td>${car.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="label">Brand:</td>
                    <td>${car.brand?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="label">Model:</td>
                    <td>${car.model || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="label">Year:</td>
                    <td>${car.year || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="label">License Plate:</td>
                    <td>${car.license_plate || 'N/A'}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Payment Details -->
              <div class="section">
                <h3>Payment Information</h3>
                <table>
                  <tr>
                    <td class="label">Base Rate:</td>
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
                    <td>${booking.payment_status || 'Pending'}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Thank You Note -->
              <div class="footer">
                <p>Thank you for choosing our Car Rental Service!</p>
                <p>For questions or assistance, please contact us at (123) 456-7890.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for resources to load then print
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Error printing receipt');
    }
  };
  
  // Update displayStats to include print buttons
  const displayStats = [
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: 'bi-calendar-date', 
      color: 'primary' 
    },
    { 
      title: 'Active Rentals', 
      value: stats.activeBookings, 
      icon: 'bi-car-front', 
      color: 'success' 
    },
    { 
      title: 'Today\'s Bookings', 
      value: stats.todayBookings, 
      icon: 'bi-calendar-check', 
      color: 'info' 
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${parseFloat(stats.thisMonthRevenue).toLocaleString()}`, 
      icon: 'bi-currency-dollar', 
      color: 'warning' 
    }
  ];
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'confirmed': return 'info';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending':
      default: return 'warning';
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading || isLoadingStats) {
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
            <h1 className="h3 mb-0">Dashboard</h1>
            <div>
              <Link to="/admin/bookings" className="btn btn-sm btn-primary">
                <i className="bi bi-calendar-check me-1"></i> Manage Bookings
              </Link>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="row g-4 mb-4">
            {displayStats.map((stat, index) => (
              <div className="col-md-6 col-xl-3" key={index}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                        <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                      </div>
                      <div>
                        <h5 className="card-title mb-0">{stat.value}</h5>
                        <p className="card-text text-muted small mb-0">{stat.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent bookings */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Bookings</h5>
                <Link to="/admin/bookings" className="btn btn-sm btn-link text-decoration-none">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Car</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>{booking.customer_name}</td>
                          <td>{booking.car?.name || 'N/A'}</td>
                          <td>{formatDate(booking.created_at)}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <Link to={`/admin/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary me-1">
                                <i className="bi bi-eye"></i>
                              </Link>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => printBookingReceipt(booking.id)}
                                title="Print Receipt"
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">No recent bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;