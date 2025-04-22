const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer'); // For handling multipart/form-data
const auth = require('./middleware/auth'); // Your auth middleware
const roleAuth = require('./middleware/roleAuth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

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
  // Similar to before, but don't include the BLOB in the default listing response
  // to avoid sending large amounts of data
  const query = 'SELECT id, title, price, address, beds, baths, sqft, propertyType, description, createdAt, userId, status FROM listings WHERE status = "active" ORDER BY createdAt DESC';
  
  db.all(query, [], (err, listings) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(listings);
  });
});

// Get a single listing by ID
router.get('/:id', (req, res) => {
  // For single listing, don't include the BLOB initially
  db.get('SELECT id, title, price, address, beds, baths, sqft, propertyType, description, createdAt, userId, status FROM listings WHERE id = ?', 
    [req.params.id], 
    (err, listing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      res.json(listing);
    }
  );
});

// Get a listing's image
router.get('/:id/image', (req, res) => {
  db.get('SELECT image, imageType FROM listings WHERE id = ?', 
    [req.params.id], 
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!result || !result.image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Send the image with the correct content type
      res.contentType(result.imageType || 'image/jpeg');
      res.send(Buffer.from(result.image));
    }
  );
});

// Create a new listing with image upload
router.post('/', [auth, roleAuth(['agent', 'manager'])], upload.single('image'), (req, res) => {
  try {
    const {
      title,
      price,
      address,
      beds,
      baths,
      sqft,
      propertyType,
      description
    } = req.body;
    
    // Validate required fields
    if (!price || !address || !beds || !baths || !sqft || !propertyType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let image = null;
    let imageType = null;
    
    // Check if an image was uploaded
    if (req.file) {
      image = req.file.buffer;
      imageType = req.file.mimetype;
    }
    
    const sql = `
      INSERT INTO listings (
        title, price, address, beds, baths, sqft, propertyType, 
        description, image, imageType, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [title, price, address, beds, baths, sqft, propertyType, description, image, imageType, req.user.id],
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a listing with optional image update
router.put('/:id', auth, (req, res) => {
  try {
    const {
      title,
      price,
      address,
      beds,
      baths,
      sqft,
      propertyType,
      description,
      status
    } = req.body;
    
    // Check if user owns this listing or is admin
    if (listing.userId !== req.user.id && req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    db.get('SELECT userId FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      // Check if user owns the listing
      if (listing.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this listing' });
      }
      
      // If there's a new image, update it
      if (req.file) {
        const updateWithImageSql = `
          UPDATE listings SET
            title = COALESCE(?, title),
            price = COALESCE(?, price),
            address = COALESCE(?, address),
            beds = COALESCE(?, beds),
            baths = COALESCE(?, baths),
            sqft = COALESCE(?, sqft),
            propertyType = COALESCE(?, propertyType),
            description = COALESCE(?, description),
            image = ?,
            imageType = ?,
            status = COALESCE(?, status)
          WHERE id = ?
        `;
        
        db.run(
          updateWithImageSql,
          [title, price, address, beds, baths, sqft, propertyType, description, 
           req.file.buffer, req.file.mimetype, status, req.params.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Listing updated successfully' });
          }
        );
      } else {
        // If no new image, update everything except the image
        const updateWithoutImageSql = `
          UPDATE listings SET
            title = COALESCE(?, title),
            price = COALESCE(?, price),
            address = COALESCE(?, address),
            beds = COALESCE(?, beds),
            baths = COALESCE(?, baths),
            sqft = COALESCE(?, sqft),
            propertyType = COALESCE(?, propertyType),
            description = COALESCE(?, description),
            status = COALESCE(?, status)
          WHERE id = ?
        `;
        
        db.run(
          updateWithoutImageSql,
          [title, price, address, beds, baths, sqft, propertyType, description, status, req.params.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Listing updated successfully' });
          }
        );
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a listing
router.delete('/:id', auth, (req, res) => {
  // Check if user owns this listing or is admin
  db.get('SELECT userId FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Check if user owns the listing
    if (listing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    db.run('DELETE FROM listings WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ message: 'Listing deleted successfully' });
    });
  });
});

// Update listing status
router.put('/:id/status', auth, (req, res) => {
  try {
    const { status } = req.body;
    const listingId = req.params.id;
    
    // Validate status
    if (!status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({ error: 'Valid status required (active or inactive)' });
    }
    
    // Get the listing to check if user has permission
    db.get('SELECT userId FROM listings WHERE id = ?', [listingId], (err, listing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      // Check if user is the owner or a manager
      if (listing.userId !== req.user.id && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Not authorized to update this listing' });
      }
      
      // Update the status
      db.run('UPDATE listings SET status = ? WHERE id = ?', [status, listingId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({ message: 'Listing status updated successfully', status });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
