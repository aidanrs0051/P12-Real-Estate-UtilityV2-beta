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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
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
router.post('/', [auth, roleAuth(['agent', 'manager'])], upload.array('images', 5), async (req, res) => {
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
    
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Insert the listing
      const listingSql = `
        INSERT INTO listings (
          title, price, address, beds, baths, sqft, propertyType, 
          description, userId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(
        listingSql,
        [title, price, address, beds, baths, sqft, propertyType, description, req.user.id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          const listingId = this.lastID;
          
          // If there are images, insert them
          if (req.files && req.files.length > 0) {
            const imageSql = `
              INSERT INTO listing_images (
                listingId, image, imageType, isPrimary, position
              ) VALUES (?, ?, ?, ?, ?)
            `;
            
            // Process each image
            let imagesProcessed = 0;
            req.files.forEach((file, index) => {
              // First image is primary by default
              const isPrimary = index === 0 ? 1 : 0;
              
              db.run(
                imageSql,
                [listingId, file.buffer, file.mimetype, isPrimary, index],
                function(err) {
                  if (err) {
                    console.error('Error inserting image:', err.message);
                  }
                  
                  imagesProcessed++;
                  
                  // If all images have been processed, commit and return
                  if (imagesProcessed === req.files.length) {
                    db.run('COMMIT');
                    res.status(201).json({
                      id: listingId,
                      message: 'Listing created successfully with images'
                    });
                  }
                }
              );
            });
          } else {
            // No images, just commit and return
            db.run('COMMIT');
            res.status(201).json({
              id: listingId,
              message: 'Listing created successfully without images'
            });
          }
        }
      );
    });
  } catch (error) {
    db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Get listing images
router.get('/:id/images', (req, res) => {
  db.all(
    'SELECT id, isPrimary, position FROM listing_images WHERE listingId = ? ORDER BY position ASC',
    [req.params.id],
    (err, images) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(images);
    }
  );
});

// Get a specific image
router.get('/:listingId/images/:imageId', (req, res) => {
  db.get(
    'SELECT image, imageType FROM listing_images WHERE id = ? AND listingId = ?',
    [req.params.imageId, req.params.listingId],
    (err, image) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Send the image with the correct content type
      res.contentType(image.imageType || 'image/jpeg');
      res.send(Buffer.from(image.image));
    }
  );
});

// Set primary image
router.put('/:listingId/images/:imageId/primary', [auth, roleAuth(['agent', 'manager'])], (req, res) => {
  // Get the listing to check if user has permission
  db.get('SELECT userId FROM listings WHERE id = ?', [req.params.listingId], (err, listing) => {
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
    
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // First reset all images to non-primary
      db.run(
        'UPDATE listing_images SET isPrimary = 0 WHERE listingId = ?',
        [req.params.listingId],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          // Then set the selected image as primary
          db.run(
            'UPDATE listing_images SET isPrimary = 1 WHERE id = ? AND listingId = ?',
            [req.params.imageId, req.params.listingId],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              if (this.changes === 0) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Image not found' });
              }
              
              db.run('COMMIT');
              res.json({ message: 'Primary image updated successfully' });
            }
          );
        }
      );
    });
  });
});

// Delete an image
router.delete('/:listingId/images/:imageId', [auth, roleAuth(['agent', 'manager'])], (req, res) => {
  // Get the listing to check if user has permission
  db.get('SELECT userId FROM listings WHERE id = ?', [req.params.listingId], (err, listing) => {
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
    
    // Check if this is the only image or if it's the primary image
    db.get(
      'SELECT COUNT(*) as total, SUM(isPrimary) as primaryCount FROM listing_images WHERE listingId = ?',
      [req.params.listingId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Get info about the image to be deleted
        db.get(
          'SELECT isPrimary FROM listing_images WHERE id = ? AND listingId = ?',
          [req.params.imageId, req.params.listingId],
          (err, image) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            if (!image) {
              return res.status(404).json({ error: 'Image not found' });
            }
            
            // Delete the image
            db.run(
              'DELETE FROM listing_images WHERE id = ? AND listingId = ?',
              [req.params.imageId, req.params.listingId],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                
                // If we deleted the primary image and there are other images,
                // set the first remaining image as primary
                if (image.isPrimary === 1 && result.total > 1) {
                  db.run(
                    'UPDATE listing_images SET isPrimary = 1 WHERE listingId = ? ORDER BY position ASC LIMIT 1',
                    [req.params.listingId],
                    (err) => {
                      if (err) {
                        console.error('Error setting new primary image:', err.message);
                      }
                    }
                  );
                }
                
                res.json({ message: 'Image deleted successfully' });
              }
            );
          }
        );
      }
    );
  });
});

// Update a listing
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
      description
    } = req.body;
    
    const listingId = req.params.id;
    
    // Check if user owns this listing or is admin
    if (req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    db.get('SELECT userId FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      // Check if user is agent
      if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Not authorized to update this listing' });
      }
      
      // Update the listing
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
          createdAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(
        sql,
        [title, price, address, beds, baths, sqft, propertyType, description, listingId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Get updated listing
          db.get('SELECT * FROM listings WHERE id = ?', [listingId], (err, updatedListing) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json(updatedListing);
          });
        }
      );
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

// Add a new image to an existing listing
router.post('/:id/images', [auth, roleAuth(['agent', 'manager'])], upload.single('image'), (req, res) => {
  // Get the listing to check if user has permission
  db.get('SELECT userId FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
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
    
    // Check if listing already has 5 images
    db.get('SELECT COUNT(*) as count FROM listing_images WHERE listingId = ?', [req.params.id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.count >= 5) {
        return res.status(400).json({ error: 'Maximum of 5 images allowed per listing' });
      }
      
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }
      
      // Insert the new image (not as primary by default)
      const imageSql = `
        INSERT INTO listing_images (
          listingId, image, imageType, isPrimary, position
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(
        imageSql,
        [req.params.id, req.file.buffer, req.file.mimetype, 0, result.count],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          const imageId = this.lastID;
          
          // If this is the only image, set it as primary
          if (result.count === 0) {
            db.run('UPDATE listing_images SET isPrimary = 1 WHERE id = ?', [imageId]);
          }
          
          res.status(201).json({
            id: imageId,
            position: result.count,
            isPrimary: result.count === 0 ? 1 : 0
          });
        }
      );
    });
  });
});

module.exports = router;
