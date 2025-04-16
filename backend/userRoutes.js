const express = require('express');
const router = express.Router();
const { db } = require('./server');
const auth = require('./middleware/auth');

// Get current user's profile
router.get('/profile', auth, (req, res) => {
  db.get('SELECT id, email, firstName, lastName, createdAt FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
  });
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  const { firstName, lastName } = req.body;
  
  db.run('UPDATE users SET firstName = ?, lastName = ? WHERE id = ?',
    [firstName, lastName, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Save a listing for a user
router.post('/saved-listings', auth, (req, res) => {
  const { listingId } = req.body;
  
  db.run('INSERT INTO saved_listings (userId, listingId) VALUES (?, ?)',
    [req.user.id, listingId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Record activity
      db.run(
        'INSERT INTO user_activity (userId, activityType, description) VALUES (?, ?, ?)',
        [req.user.id, 'SAVE_LISTING', `User saved listing #${listingId}`]
      );
      
      res.status(201).json({ 
        id: this.lastID,
        message: 'Listing saved successfully' 
      });
    }
  );
});

// Get user's saved listings
router.get('/saved-listings', auth, (req, res) => {
  db.all('SELECT * FROM saved_listings WHERE userId = ?', [req.user.id], (err, listings) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(listings);
  });
});

// Get user activity
router.get('/activity', auth, (req, res) => {
  db.all('SELECT * FROM user_activity WHERE userId = ? ORDER BY timestamp DESC LIMIT 10', 
    [req.user.id], (err, activities) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(activities);
    }
  );
});

module.exports = router;