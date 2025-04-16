import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ListingsGrid from '../components/ListingsGrid';
import Filters from '../components/Filters';
import Newsletter from '../components/Newsletter';

const HomePage = () => {
  // State to hold listings data
  const [featuredListings, setFeaturedListings] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // This would be replaced with an API call in the future
    // Example: fetchListingsData().then(data => {
    //   setFeaturedListings(data.featured);
    //   setNewListings(data.new);
    //   setIsLoading(false);
    // });
    
    // For now, use sample data
    setFeaturedListings([
      {
        id: 1,
        price: '$549,000',
        address: '123 Main St, Anytown, ST 12345',
        beds: 4,
        baths: 3,
        sqft: '2,250',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 2,
        price: '$379,900',
        address: '456 Oak Ave, Somecity, ST 67890',
        beds: 3,
        baths: 2,
        sqft: '1,850',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 3,
        price: '$689,000',
        address: '789 Pine Rd, Otherville, ST 24680',
        beds: 5,
        baths: 3.5,
        sqft: '3,100',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 4,
        price: '$425,000',
        address: '321 Cedar Ln, Newtown, ST 13579',
        beds: 3,
        baths: 2.5,
        sqft: '2,000',
        imageUrl: '/api/placeholder/300/200'
      }
    ]);
    
    setNewListings([
      {
        id: 5,
        price: '$510,000',
        address: '555 Maple Dr, Evergreen, ST 97531',
        beds: 4,
        baths: 2,
        sqft: '2,400',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 6,
        price: '$350,000',
        address: '777 Birch St, Hometown, ST 86420',
        beds: 2,
        baths: 2,
        sqft: '1,600',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 7,
        price: '$725,000',
        address: '999 Elm Ct, Riverside, ST 36925',
        beds: 5,
        baths: 4,
        sqft: '3,500',
        imageUrl: '/api/placeholder/300/200'
      },
      {
        id: 8,
        price: '$399,500',
        address: '444 Willow Way, Lakeside, ST 25836',
        beds: 3,
        baths: 2,
        sqft: '1,950',
        imageUrl: '/api/placeholder/300/200'
      }
    ]);
    
    setIsLoading(false);
  }, []);

  // Handler for filter changes
  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
    // This would trigger a new API call with filter parameters
    // Example: fetchFilteredListings(filters).then(data => {
    //   setFeaturedListings(data.featured);
    //   setNewListings(data.new);
    // });
  };

  if (isLoading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <div className="container py-4">
        <ListingsGrid title="Featured Listings" listings={featuredListings} />
        <Filters onFilterChange={handleFilterChange} />
        <ListingsGrid title="New on the Market" listings={newListings} />
        <Newsletter />
      </div>
    </div>
  );
};

export default HomePage;