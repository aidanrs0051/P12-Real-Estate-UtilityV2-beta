import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ReportsPage = () => {
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState({
    title: "Report Generator",
    description: "No report type specified."
  });

  useEffect(() => {
    const type = searchParams.get('type');
    
    if (type === 'open') {
      setReportData({
        title: "Open Listings Report",
        description: "Generating report for active/open listings."
      });
    } else if (type === 'closed') {
      setReportData({
        title: "Closed Listings Report",
        description: "Generating report for closed/completed listings."
      });
    } else {
      setReportData({
        title: "Report Generator",
        description: "No report type specified."
      });
    }
  }, [searchParams]);

  return (
    <div className="container report-container" style={{ padding: '60px 0', textAlign: 'center' }}>
      <h1 id="reportTitle">{reportData.title}</h1>
      <p id="reportDescription">{reportData.description}</p>
      
      {/* This section can be expanded with more report details and generation functionality */}
      <div className="mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Generate Custom Report</h5>
                <div className="mb-3">
                  <label htmlFor="reportTypeSelect" className="form-label">Report Type</label>
                  <select className="form-select" id="reportTypeSelect">
                    <option value="">Select a report type</option>
                    <option value="open">Open Listings</option>
                    <option value="closed">Closed Listings</option>
                    <option value="agent">Agent Performance</option>
                    <option value="market">Market Analysis</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="dateRangeSelect" className="form-label">Date Range</label>
                  <select className="form-select" id="dateRangeSelect">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="formatSelect" className="form-label">Format</label>
                  <select className="form-select" id="formatSelect">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <button className="btn btn-primary">Generate Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;