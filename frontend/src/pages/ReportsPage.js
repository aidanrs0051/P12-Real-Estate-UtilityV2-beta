import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReportsPage = () => {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const [reportData, setReportData] = useState({
    title: "Report Generator",
    description: "No report type specified."
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const { isAuthenticated, isManager } = useContext(AuthContext);

  // Form state
  const [formData, setFormData] = useState({
    reportType: 'none',
    dateRange: '30',
    format: 'csv'
  });

  // Show alert message
  const showAlert = useCallback((message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  }, []);

  // Fetch reports
  const getReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showAlert(error.message || 'Error fetching reports', 'destructive');
    }
  }, [showAlert]);

  // Handle page parameters and report type
  useEffect(() => {
    const type = searchParams.get('type');
    
    if (isAuthenticated && !isManager()) {
      setLocation('/');
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
  }, [searchParams, isAuthenticated, isManager, setLocation]);
  
  // Separate useEffect for fetching reports only on component mount
  useEffect(() => {
    if (isAuthenticated) {
      // Use a small timeout to prevent immediate execution
      const timer = setTimeout(() => {
        getReports();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]); // Remove getReports from dependencies

  const handleTypeChange = (value) => {
    setFormData(prev => ({ ...prev, reportType: value }));
  };

  const handleDateRangeChange = (value) => {
    setFormData(prev => ({ ...prev, dateRange: value }));
  };

  const handleFormatChange = (value) => {
    setFormData(prev => ({ ...prev, format: value }));
  };

  const handleGenerateReport = async () => {
    if (!formData.reportType || formData.reportType === 'none') {
      showAlert('Please select a report type', 'warning');
      return;
    }
    
    setLoading(true);
    
    try {
      await generateReport(formData);
      
      showAlert(`${formData.reportType === 'open' ? 'Open' : 'Closed'} listing report generated successfully!`, 'success');
      
      // Refresh the reports list
      await getReports();
    } catch (error) {
      console.error('Error generating report:', error);
      showAlert(error.message || 'Error generating report', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (filename) => {
    // Create download link
    const link = document.createElement('a');
    link.href = getDownloadUrl(filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Alert Element
  const createAlertElement = () => {
    if (!alertMessage) return null;
    
    const alertClassName = `mb-6 ${
      alertType === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
      alertType === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
      'bg-red-50 border-red-200 text-red-800'
    }`;
    
    const iconElement = alertType === 'success' ? 
      React.createElement(CheckCircle, { className: "h-4 w-4 mr-2" }) : 
      React.createElement(AlertCircle, { className: "h-4 w-4 mr-2" });
    
    return React.createElement(
      Alert,
      { className: alertClassName },
      iconElement,
      React.createElement(AlertDescription, null, alertMessage)
    );
  };

  // Create Report Generator Form
  const createReportGeneratorForm = () => {
    return React.createElement(
      Card,
      null,
      React.createElement(
        CardHeader,
        { className: "bg-primary text-primary-foreground" },
        React.createElement(CardTitle, null, "Generate Custom Report")
      ),
      React.createElement(
        CardContent,
        { className: "pt-6" },
        React.createElement(
          "div",
          { className: "space-y-4" },
          // Report Type
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              "label",
              { htmlFor: "reportType", className: "text-sm font-medium" },
              "Report Type"
            ),
            React.createElement(
              Select,
              { value: formData.reportType, onValueChange: handleTypeChange },
              React.createElement(
                SelectTrigger,
                { id: "reportType" },
                React.createElement(SelectValue, { placeholder: "Select a report type" })
              ),
              React.createElement(
                SelectContent,
                null,
                React.createElement(SelectItem, { value: "none" }, "Select a report type"),
                React.createElement(SelectItem, { value: "open" }, "Open Listings"),
                React.createElement(SelectItem, { value: "closed" }, "Closed Listings"),
                React.createElement(SelectItem, { value: "agent" }, "Agent Performance"),
                React.createElement(SelectItem, { value: "market" }, "Market Analysis")
              )
            )
          ),
          
          // Date Range
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              "label",
              { htmlFor: "dateRange", className: "text-sm font-medium" },
              "Date Range"
            ),
            React.createElement(
              Select,
              { value: formData.dateRange, onValueChange: handleDateRangeChange },
              React.createElement(
                SelectTrigger,
                { id: "dateRange" },
                React.createElement(SelectValue, { placeholder: "Select date range" })
              ),
              React.createElement(
                SelectContent,
                null,
                React.createElement(SelectItem, { value: "7" }, "Last 7 days"),
                React.createElement(SelectItem, { value: "30" }, "Last 30 days"),
                React.createElement(SelectItem, { value: "90" }, "Last 90 days"),
                React.createElement(SelectItem, { value: "365" }, "Last year"),
                React.createElement(SelectItem, { value: "custom" }, "Custom range")
              )
            )
          ),
          
          // Format
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              "label",
              { htmlFor: "format", className: "text-sm font-medium" },
              "Format"
            ),
            React.createElement(
              Select,
              { value: formData.format, onValueChange: handleFormatChange },
              React.createElement(
                SelectTrigger,
                { id: "format" },
                React.createElement(SelectValue, { placeholder: "Select format" })
              ),
              React.createElement(
                SelectContent,
                null,
                React.createElement(SelectItem, { value: "csv" }, "CSV"),
                React.createElement(SelectItem, { value: "excel" }, "Excel"),
                React.createElement(SelectItem, { value: "pdf" }, "PDF")
              )
            )
          ),
          
          // Generate Button
          React.createElement(
            Button,
            { 
              className: "w-full",
              onClick: handleGenerateReport,
              disabled: loading
            },
            loading ? 
              React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "svg",
                  { 
                    className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", 
                    xmlns: "http://www.w3.org/2000/svg", 
                    fill: "none", 
                    viewBox: "0 0 24 24"
                  },
                  React.createElement(
                    "circle",
                    { 
                      className: "opacity-25", 
                      cx: "12", 
                      cy: "12", 
                      r: "10", 
                      stroke: "currentColor", 
                      strokeWidth: "4"
                    }
                  ),
                  React.createElement(
                    "path",
                    { 
                      className: "opacity-75", 
                      fill: "currentColor", 
                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }
                  )
                ),
                "Generating..."
              ) : 
              "Generate Report"
          )
        )
      )
    );
  };

  // Create Available Reports Card
  const createAvailableReportsCard = () => {
    return React.createElement(
      Card,
      null,
      React.createElement(
        CardHeader,
        { className: "bg-primary text-primary-foreground" },
        React.createElement(CardTitle, null, "Available Reports")
      ),
      React.createElement(
        CardContent,
        { className: "p-0" },
        reports.length === 0 ? 
          React.createElement(
            "div",
            { className: "p-6 text-center" },
            React.createElement(
              "p",
              { className: "text-muted-foreground" },
              "No reports available. Generate a report to see it here."
            )
          ) : 
          React.createElement(
            "div",
            { className: "divide-y" },
            reports.map((report, index) => 
              React.createElement(
                "div",
                { key: index, className: "flex justify-between items-center p-4" },
                React.createElement(
                  "div",
                  { className: "flex items-center" },
                  React.createElement(
                    "span",
                    { 
                      className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.type === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      } mr-2`
                    },
                    report.type === 'open' ? 'Open' : 'Closed'
                  ),
                  React.createElement(
                    "span",
                    { className: "text-sm text-gray-600" },
                    new Date(report.createdAt).toLocaleString()
                  )
                ),
                React.createElement(
                  Button,
                  { 
                    variant: "outline", 
                    size: "sm",
                    onClick: () => downloadReport(report.filename)
                  },
                  React.createElement(Download, { className: "h-4 w-4 mr-1" }),
                  "Download"
                )
              )
            )
          )
      )
    );
  };

  // Main render
  return React.createElement(
    "div",
    { className: "container mx-auto px-4 py-8 max-w-7xl" },
    createAlertElement(),
    React.createElement(
      "h1",
      { className: "text-3xl font-bold text-center mb-3" },
      reportData.title
    ),
    React.createElement(
      "p",
      { className: "text-center mb-8 text-muted-foreground" },
      reportData.description
    ),
    React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
      createReportGeneratorForm(),
      createAvailableReportsCard()
    )
  );
};

export default ReportsPage;