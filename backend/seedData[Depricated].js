const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database for seeding');
    seedDatabase();
  }
});

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Create an admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  db.run(
    'INSERT OR IGNORE INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
    ['admin@example.com', hashedPassword, 'Admin', 'User'],
    function(err) {
      if (err) {
        console.error('Error creating admin user:', err.message);
      } else {
        console.log('Admin user created or already exists');
        const userId = this.lastID || 1; // Use lastID or default to 1 if already exists
        
        // Create sample listings
        const sampleListings = [
          {
            title: 'Spacious Family Home',
            price: '$549,000',
            address: '123 Main St, Anytown, ST 12345',
            beds: 4,
            baths: 3,
            sqft: '2,250',
            propertyType: 'house',
            description: 'Beautiful spacious family home with large backyard and modern amenities.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Downtown Condo',
            price: '$379,900',
            address: '456 Oak Ave, Somecity, ST 67890',
            beds: 3,
            baths: 2,
            sqft: '1,850',
            propertyType: 'condo',
            description: 'Modern condo in the heart of downtown with amazing city views.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Luxury Estate',
            price: '$689,000',
            address: '789 Pine Rd, Otherville, ST 24680',
            beds: 5,
            baths: 3.5,
            sqft: '3,100',
            propertyType: 'house',
            description: 'Luxurious estate with pool, outdoor kitchen, and spacious living areas.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Cozy Townhouse',
            price: '$425,000',
            address: '321 Cedar Ln, Newtown, ST 13579',
            beds: 3,
            baths: 2.5,
            sqft: '2,000',
            propertyType: 'townhouse',
            description: 'Charming townhouse in a quiet neighborhood with modern finishes.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Suburban Retreat',
            price: '$510,000',
            address: '555 Maple Dr, Evergreen, ST 97531',
            beds: 4,
            baths: 2,
            sqft: '2,400',
            propertyType: 'house',
            description: 'Peaceful suburban home with large yard and updated kitchen.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Urban Apartment',
            price: '$350,000',
            address: '777 Birch St, Hometown, ST 86420',
            beds: 2,
            baths: 2,
            sqft: '1,600',
            propertyType: 'apartment',
            description: 'Stylish urban apartment close to parks, shops, and restaurants.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Waterfront Paradise',
            price: '$725,000',
            address: '999 Elm Ct, Riverside, ST 36925',
            beds: 5,
            baths: 4,
            sqft: '3,500',
            propertyType: 'house',
            description: 'Stunning waterfront property with private dock and panoramic views.',
            imageUrl: '/api/placeholder/800/600',
            userId
          },
          {
            title: 'Country Cottage',
            price: '$399,500',
            address: '444 Willow Way, Lakeside, ST 25836',
            beds: 3,
            baths: 2,
            sqft: '1,950',
            propertyType: 'house',
            description: 'Charming cottage in the countryside with beautiful gardens.',
            imageUrl: '/api/placeholder/800/600',
            userId
          }
        ];
        
        // Insert each listing
        const insertStmt = db.prepare(
          'INSERT OR IGNORE INTO listings (title, price, address, beds, baths, sqft, propertyType, description, imageUrl, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        
        sampleListings.forEach(listing => {
          insertStmt.run(
            listing.title,
            listing.price,
            listing.address,
            listing.beds,
            listing.baths,
            listing.sqft,
            listing.propertyType,
            listing.description,
            listing.imageUrl,
            listing.userId,
            function(err) {
              if (err) {
                console.error(`Error inserting listing "${listing.title}":`, err.message);
              } else {
                console.log(`Listing "${listing.title}" created or already exists`);
              }
            }
          );
        });
        
        insertStmt.finalize();
        
        console.log('Database seeding completed');
        db.close();
      }
    }
  );
}
