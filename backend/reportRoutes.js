const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('./middleware/auth');
const { generateReport, getReports } = require('./reportsController');

// Generate a new report
router.post('/generate', auth, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || (type !== 'open' && type !== 'closed')) {
      return res.status(400).json({ error: 'Valid report type required (open or closed)' });
    }
    
    const report = await generateReport(type);
    
    res.json({
      success: true,
      message: `${type === 'open' ? 'Open' : 'Closed'} listings report generated successfully`,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get list of available reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await getReports();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Download a report
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Validate filename to prevent directory traversal
  if (!/^[a-zA-Z0-9_-]+\.csv$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const filePath = path.join(__dirname, 'reports', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  
  // Stream the file to the response
  fs.createReadStream(filePath).pipe(res);
});

module.exports = router;
