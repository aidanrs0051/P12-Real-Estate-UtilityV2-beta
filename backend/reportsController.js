const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// Generate report for listings
const generateReport = async (type) => {
  return new Promise((resolve, reject) => {
    // Get current timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
    const filename = `${type}_listings_${timestamp}.csv`;
    const reportPath = path.join(reportsDir, filename);
    
    // CSV Headers
    const headers = 'ID,Price,Address,Beds,Baths,Square Feet,Status,Created Date\n';
    
    // SQL query based on report type
    const query = type === 'open' 
      ? "SELECT * FROM listings WHERE status = 'active'"
      : "SELECT * FROM listings WHERE status != 'active'";
    
    db.all(query, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      try {
        // Create CSV file with headers
        fs.writeFileSync(reportPath, headers);
        
        // Add each row to the CSV
        rows.forEach(row => {
          const csvLine = `${row.id},"${row.price}","${row.address}",${row.beds},${row.baths},${row.sqft},"${row.status}","${row.createdAt}"\n`;
          fs.appendFileSync(reportPath, csvLine);
        });
        
        // Return success with file info
        resolve({
          filename,
          path: reportPath,
          count: rows.length
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Get list of available reports
const getReports = () => {
  return new Promise((resolve, reject) => {
    // Read the reports directory
    fs.readdir(reportsDir, (err, files) => {
      if (err) {
        return reject(err);
      }
      
      // Filter for CSV files and parse information
      const reports = files
        .filter(file => file.endsWith('.csv'))
        .map(file => {
          const type = file.startsWith('open_') ? 'open' : 'closed';
          const stats = fs.statSync(path.join(reportsDir, file));
          
          return {
            filename: file,
            type: type,
            size: stats.size,
            createdAt: stats.birthtime
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Sort newest first
      
      resolve(reports);
    });
  });
};

module.exports = {
  generateReport,
  getReports
};
