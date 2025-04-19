const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const authRoutes = require('./authRoutes');
const listingRoutes = require('./listingRoutes');
const reportRoutes = require('./reportRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Server connection successful');
    createTables();
  }
});

// Create necessary tables if they don't exist
function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Listings table
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      price TEXT NOT NULL,
      address TEXT NOT NULL,
      beds INTEGER NOT NULL,
      baths REAL NOT NULL,
      sqft TEXT NOT NULL,
      propertyType TEXT NOT NULL,
      description TEXT,
      image BLOB,
      imageType TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      userId INTEGER,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reports', reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
