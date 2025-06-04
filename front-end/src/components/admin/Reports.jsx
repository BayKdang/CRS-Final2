// Create a new component for generating reports:
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

// Import Chart.js components for visualizations
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { admin, isLoading: authLoading } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  
  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(formatDate(end));
    setStartDate(formatDate(start));
  }, []);
  
  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch report data based on selected filters
  useEffect(() => {
    const fetchReportData = async () => {
      if (!admin?.token || !startDate || !endDate) return;
      
      try {
        setIsLoading(true);
        
        // Build query string for API request
        const params = new URLSearchParams({
          report_type: reportType,
          date_range: dateRange,
          start_date: startDate,
          end_date: endDate
        }).toString();
        
        const response = await fetch(`http://localhost:8000/api/admin/reports?${params}`, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [admin, reportType, dateRange, startDate, endDate]);
  
  // Handle date range presets
  const handleDateRangeChange = (range) => {
    const end = new Date();
    const start = new Date();
    
    switch(range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        // Custom range - don't change dates
        break;
    }
    
    setDateRange(range);
    if (range !== 'custom') {
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // The useEffect will trigger a data fetch
  };
  
  // Handle report export as CSV
  const handleExportCSV = async () => {
    if (!admin?.token || !reportData) return;
    
    try {
      const params = new URLSearchParams({
        report_type: reportType,
        start_date: startDate,
        end_date: endDate
      }).toString();
      
      const response = await fetch(`http://localhost:8000/api/admin/reports/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `JOUL_Report_${reportType}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported as CSV successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report as CSV');
    }
  };

  // Prepare chart data for Revenue Report
  const prepareRevenueChartData = () => {
    if (!reportData || !reportData.data) return null;
    
    const labels = reportData.data.map(item => item.period);
    const revenueData = reportData.data.map(item => item.revenue);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Prepare chart data for Bookings Report
  const prepareBookingsChartData = () => {
    if (!reportData || !reportData.data) return null;
    
    const labels = reportData.data.map(item => item.period);
    const bookingsData = reportData.data.map(item => item.bookings_count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Bookings',
          data: bookingsData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Prepare chart data for Car Utilization Report
  const prepareCarUtilizationChartData = () => {
    if (!reportData || !reportData.car_utilization) return null;
    
    const labels = reportData.car_utilization.map(item => item.car_name || `Car ID: ${item.car_id}`);
    const utilizationData = reportData.car_utilization.map(item => item.utilization_rate);
    
    return {
      labels,
      datasets: [
        {
          label: 'Utilization Rate (%)',
          data: utilizationData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: reportType === 'revenue' 
          ? 'Revenue Report' 
          : reportType === 'bookings' 
          ? 'Bookings Report'
          : 'Car Utilization Report'
      },
    },
  };

  // Render loading state
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Render reports component
  return (
    <div className="d-flex">
      <AdminSidebar />
      
      <div className="flex-grow-1">
        <AdminHeader adminName={admin?.name || 'Admin'} />
        
        <div className="container-fluid py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Reports</h1>
            
            <div>
              <button 
                className="btn btn-outline-primary" 
                onClick={handleExportCSV}
                disabled={!reportData}
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
              </button>
            </div>
          </div>
          
          {/* Reports Filter Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Report Type</label>
                  <select 
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="revenue">Revenue Report</option>
                    <option value="bookings">Bookings Report</option>
                    <option value="car_utilization">Car Utilization Report</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Date Range</label>
                  <select 
                    className="form-select"
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                  />
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={formatDate(new Date())}
                  />
                </div>
                
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Report Content */}
          <div className="card shadow-sm">
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Generating report...</p>
                </div>
              ) : reportData ? (
                <div>
                  {/* Report Summary */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <h6 className="text-white-50">Total Revenue</h6>
                          <h3 className="mb-0">
                            ${reportData.summary?.total_revenue?.toFixed(2) || '0.00'}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <h6 className="text-white-50">Total Bookings</h6>
                          <h3 className="mb-0">
                            {reportData.summary?.total_bookings || '0'}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <h6 className="text-white-50">Average Value</h6>
                          <h3 className="mb-0">
                            ${reportData.summary?.avg_booking_value?.toFixed(2) || '0.00'}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div style={{ height: '400px' }} className="mb-4">
                    {reportType === 'revenue' && prepareRevenueChartData() && (
                      <Bar 
                        data={prepareRevenueChartData()} 
                        options={chartOptions} 
                      />
                    )}
                    
                    {reportType === 'bookings' && prepareBookingsChartData() && (
                      <Line 
                        data={prepareBookingsChartData()} 
                        options={chartOptions} 
                      />
                    )}
                    
                    {reportType === 'car_utilization' && prepareCarUtilizationChartData() && (
                      <div className="row">
                        <div className="col-md-8 mx-auto">
                          <Pie 
                            data={prepareCarUtilizationChartData()} 
                            options={{
                              ...chartOptions,
                              maintainAspectRatio: false,
                              plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                  position: 'right',
                                }
                              }
                            }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Data Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover border">
                      <thead>
                        <tr>
                          <th>Period</th>
                          {reportType === 'revenue' && <th>Revenue</th>}
                          {reportType === 'bookings' && (
                            <>
                              <th>Bookings</th>
                              <th>Completed</th>
                              <th>Cancelled</th>
                              <th>Revenue</th>
                            </>
                          )}
                          {reportType === 'car_utilization' && (
                            <>
                              <th>Car</th>
                              <th>Total Bookings</th>
                              <th>Days Booked</th>
                              <th>Utilization Rate</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {reportType !== 'car_utilization' && reportData.data?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            {reportType === 'revenue' && (
                              <td>${item.revenue?.toFixed(2) || '0.00'}</td>
                            )}
                            {reportType === 'bookings' && (
                              <>
                                <td>{item.bookings_count || '0'}</td>
                                <td>{item.completed_count || '0'}</td>
                                <td>{item.cancelled_count || '0'}</td>
                                <td>${item.revenue?.toFixed(2) || '0.00'}</td>
                              </>
                            )}
                          </tr>
                        ))}
                        
                        {reportType === 'car_utilization' && reportData.car_utilization?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.car_name || `Car ID: ${item.car_id}`}</td>
                            <td>{item.bookings_count || '0'}</td>
                            <td>{item.days_booked || '0'}</td>
                            <td>{item.utilization_rate?.toFixed(2) || '0.00'}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up display-4 text-secondary"></i>
                  <p className="mt-2">Select report parameters and click "Generate Report"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;