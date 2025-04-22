import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReportsPage = () => {
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState({
    title: "Report Generator",
    description: "No report type specified."
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const { isAuthenticated, isManager } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Form state
  const [formData, setFormData] = useState({
    reportType: '',
    dateRange: '30',
    format: 'csv'
  });

  useEffect(() => {
    const type = searchParams.get('type');
    
    if (isAuthenticated && !isManager()) {
      navigate('/');
      return;
    } else if (type === 'open') {
      setReportData({
        title: "Open Listings Report",
        description: "Generating report for active/open listings."
      });
      setFormData(prev => ({ ...prev, reportType: 'open' }));
    } else if (type === 'closed') {
      setReportData({
        title: "Closed Listings Report",
        description: "Generating report for closed/completed listings."
      });
      setFormData(prev => ({ ...prev, reportType: 'closed' }));
    } else {
      setReportData({
        title: "Report Generator",
        description: "No report type specified."
      });
    }

    // Fetch available reports when component mounts
    /*if (isAuthenticated) {
      fetchReports();
    }*/
  }, [searchParams, isAuthenticated, isManager, navigate]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Authentication required to view reports', 'warning');
        return;
      }
      
      const response = await fetch(`${API_URL}/reports`, {
        headers: {
          // Make sure the header name matches what your middleware expects
          'x-auth-token': token
        }
      });
      
      if (response.status === 401) {
        showAlert('Your session has expired. Please log in again', 'warning');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showAlert('Error fetching reports', 'danger');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    // Map the form field IDs to the formData keys
    const fieldMap = {
      'reportTypeSelect': 'reportType',
      'dateRangeSelect': 'dateRange',
      'formatSelect': 'format'
    };
    
    setFormData({
      ...formData,
      [fieldMap[id] || id]: value
    });
  };

  const generateReport = async () => {
    if (!formData.reportType) {
      showAlert('Please select a report type', 'warning');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('You must be logged in to generate reports', 'warning');
        return;
      }
      
      const response = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          type: formData.reportType,
          dateRange: formData.dateRange,
          format: formData.format
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error generating report');
      }
      
      showAlert(`${formData.reportType === 'open' ? 'Open' : 'Closed'} listing report generated successfully!`, 'success');
      
      // Refresh the reports list
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      showAlert(`Error: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (filename) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showAlert('You must be logged in to download reports', 'warning');
      return;
    }
    
    // Create download link
    window.location.href = `${API_URL}/reports/download/${filename}?token=${token}`;
  };

  const showAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  return (
    <div className="container report-container py-5">
      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlertMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <h1 className="text-center mb-3" id="reportTitle">{reportData.title}</h1>
      <p className="text-center mb-5" id="reportDescription">{reportData.description}</p>
      
      <div className="row">
        {/* Report Generator Form */}
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Generate Custom Report</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="reportTypeSelect" className="form-label">Report Type</label>
                <select 
                  className="form-select" 
                  id="reportTypeSelect"
                  value={formData.reportType}
                  onChange={handleInputChange}
                >
                  <option value="">Select a report type</option>
                  <option value="open">Open Listings</option>
                  <option value="closed">Closed Listings</option>
                  <option value="agent">Agent Performance</option>
                  <option value="market">Market Analysis</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="dateRangeSelect" className="form-label">Date Range</label>
                <select 
                  className="form-select" 
                  id="dateRangeSelect"
                  value={formData.dateRange}
                  onChange={handleInputChange}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="formatSelect" className="form-label">Format</label>
                <select 
                  className="form-select" 
                  id="formatSelect"
                  value={formData.format}
                  onChange={handleInputChange}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <button 
                className="btn btn-primary w-100"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Available Reports */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Available Reports</h5>
            </div>
            <div className="card-body p-0">
              {reports.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-muted mb-0">No reports available. Generate a report to see it here.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {reports.map((report, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge ${report.type === 'open' ? 'bg-success' : 'bg-secondary'} me-2`}>
                          {report.type === 'open' ? 'Open' : 'Closed'}
                        </span>
                        <span>
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => downloadReport(report.filename)}
                      >
                        <i className="bi bi-download me-1"></i>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;