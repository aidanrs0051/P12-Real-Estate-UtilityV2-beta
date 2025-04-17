import React, { useState, useEffect, useCallback } from 'react';
import Hero from '../components/Hero';
import ListingsGrid from '../components/ListingsGrid';
import Filters from '../components/Filters';
import Newsletter from '../components/Newsletter';

const HomePage = () => {
  // State to hold listings data
  const [featuredListings, setFeaturedListings] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Memoize the fetchListings function with useCallback
  const fetchListings = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      
      // Create query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/listings?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      
      // Sort by price for featured listings (most expensive first)
      const sortedByPrice = [...data].sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[$,]/g, ''));
        const priceB = parseFloat(b.price.replace(/[$,]/g, ''));
        return priceB - priceA;
      });
      
      // Featured listings are the top 4 most expensive
      setFeaturedListings(sortedByPrice.slice(0, 4));
      
      // New listings are the 4 most recently added
      setNewListings(data.slice(0, 4));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]); // API_URL is the only dependency

  useEffect(() => {
    // Fetch listings when component mounts
    fetchListings();
  }, [fetchListings]); // Include fetchListings in the dependency array

  // Handler for filter changes
  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
    fetchListings(filters);
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <div className="container py-4">
        {featuredListings.length > 0 ? (
          <ListingsGrid title="Featured Listings" listings={featuredListings} />
        ) : (
          <div className="alert alert-info">No featured listings available.</div>
        )}
        
        <Filters onFilterChange={handleFilterChange} />
        
        {newListings.length > 0 ? (
          <ListingsGrid title="New on the Market" listings={newListings} />
        ) : (
          <div className="alert alert-info">No new listings available.</div>
        )}
        
        <Newsletter />
      </div>
    </div>
  );
};

export default HomePage;