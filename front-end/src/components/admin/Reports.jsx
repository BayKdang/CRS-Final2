// Create a new component for generating reports:
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { toast } from 'react-toastify';

const Reports = () => {
  const { admin } = useAdminAuth();
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const generateReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(dateRange)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      } else {
        toast.error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1">
        <AdminHeader adminName={admin?.name || 'Admin'} />
        
        <div className="container-fluid py-4 px-4">
          <h1 className="h3 mb-4">Reports</h1>
          
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Report Type</label>
                  <select 
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="bookings">Bookings Report</option>
                    <option value="revenue">Revenue Report</option>
                    <option value="cars">Cars Utilization</option>
                    <option value="customers">Customer Analysis</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">From Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">To Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  />
                </div>
                
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={generateReport}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Generating...</>
                    ) : (
                      'Generate Report'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Results */}
          {reportData && (
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    // Export logic
                  }}
                >
                  <i className="bi bi-download me-1"></i> Export
                </button>
              </div>
              <div className="card-body">
                {/* Dynamic report content based on reportType */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;