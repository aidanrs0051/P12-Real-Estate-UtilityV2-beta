const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database for listings');
  }
});

// Get all listings
router.get('/', (req, res) => {
  // Parse filter parameters from query string
  const { minPrice, maxPrice, beds, baths, propertyType } = req.query;
  
  let query = 'SELECT * FROM listings WHERE status = "active"';
  const params = [];
  
  if (minPrice) {
    // Remove $ and commas for numeric comparison
    const numericMinPrice = parseFloat(minPrice.replace(/[$,]/g, ''));
    query += ' AND CAST(REPLACE(REPLACE(price, "$", ""), ",", "") AS REAL) >= ?';
    params.push(numericMinPrice);
  }
  
  if (maxPrice) {
    const numericMaxPrice = parseFloat(maxPrice.replace(/[$,]/g, ''));
    query += ' AND CAST(REPLACE(REPLACE(price, "$", ""), ",", "") AS REAL) <= ?';
    params.push(numericMaxPrice);
  }
  
  if (beds) {
    query += ' AND beds >= ?';
    params.push(parseInt(beds));
  }
  
  if (baths) {
    query += ' AND baths >= ?';
    params.push(parseFloat(baths));
  }
  
  if (propertyType && propertyType !== 'any') {
    query += ' AND propertyType = ?';
    params.push(propertyType);
  }
  
  query += ' ORDER BY createdAt DESC';
  
  db.all(query, params, (err, listings) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(listings);
  });
});

// Get a single listing by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(listing);
  });
});

// Create a new listing
router.post('/', (req, res) => {
  const {
    title,
    price,
    address,
    beds,
    baths,
    sqft,
    propertyType,
    description,
    imageUrl,
    userId
  } = req.body;
  
  const sql = `
    INSERT INTO listings (
      title, price, address, beds, baths, sqft, propertyType, 
      description, imageUrl, userId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(
    sql,
    [title, price, address, beds, baths, sqft, propertyType, description, imageUrl, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Listing created successfully'
      });
    }
  );
});

// Update a listing
router.put('/:id', (req, res) => {
  const {
    title,
    price,
    address,
    beds,
    baths,
    sqft,
    propertyType,
    description,
    imageUrl,
    status
  } = req.body;
  
  const sql = `
    UPDATE listings SET
      title = COALESCE(?, title),
      price = COALESCE(?, price),
      address = COALESCE(?, address),
      beds = COALESCE(?, beds),
      baths = COALESCE(?, baths),
      sqft = COALESCE(?, sqft),
      propertyType = COALESCE(?, propertyType),
      description = COALESCE(?, description),
      imageUrl = COALESCE(?, imageUrl),
      status = COALESCE(?, status)
    WHERE id = ?
  `;
  
  db.run(
    sql,
    [title, price, address, beds, baths, sqft, propertyType, description, imageUrl, status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      res.json({ message: 'Listing updated successfully' });
    }
  );
});

// Delete a listing
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM listings WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json({ message: 'Listing deleted successfully' });
  });
});

module.exports = router;
