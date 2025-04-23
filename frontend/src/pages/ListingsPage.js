import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [listingImages, setListingImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const { isAuthenticated, isAgent } = useContext(AuthContext);

  useEffect(() => {
    fetchListings(); // eslint-disable-next-line
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/listings');
      const data = await response.json();
      setListings(data);
      
      // After getting listings, fetch their primary images
      fetchPrimaryImages(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrimaryImages = async (listingsData) => {
    const imageData = {};
    
    for (const listing of listingsData) {
      try {
        // Fetch images for this listing
        const response = await fetch(`${API_URL}/listings/${listing.id}/images`);
        
        if (response.ok) {
          const images = await response.json();
          // Find primary image
          const primaryImage = images.find(img => img.isPrimary === 1) || images[0];
          
          if (primaryImage) {
            imageData[listing.id] = primaryImage.id;
          }
        }
      } catch (error) {
        console.error(`Error fetching images for listing ${listing.id}:`, error);
      }
    }
    
    setListingImages(imageData);
  };
  
  return (
    <div className="container my-5">
      {alertMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {alertMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlertMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <h1 className="text-center mb-4">Featured Listings</h1>
      {isAuthenticated && isAgent() && (
        <div className="text-end mb-4">
          <Link to="/listings/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create New Listing
          </Link>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {listings.map(listing => (
            <div className="col" key={listing.id}>
              <div className="card listing-card h-100">
                <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    {/* Use primary image if available, otherwise fall back to the standard image URL */}
                    {listingImages[listing.id] ? (
                      <img 
                        src={`${API_URL}/listings/${listing.id}/images/${listingImages[listing.id]}`} 
                        className="card-img-top" 
                        alt={`Property at ${listing.address}`}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/200';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <img 
                        src={`${API_URL}/listings/${listing.id}/image`} 
                        className="card-img-top" 
                        alt={`Property at ${listing.address}`}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/200';
                          e.target.onerror = null;
                        }}
                      />
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">${listing.price}</h5>
                    <p className="card-text">
                      {listing.address}<br />
                      {listing.beds} beds | {listing.baths} baths | {listing.sqft} sqft
                    </p>
                    {listing.status !== 'active' && (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && listings.length === 0 && (
        <div className="text-center my-5">
          <p className="lead">No listings found</p>
          {isAuthenticated && isAgent() && (
            <Link to="/listings/new" className="btn btn-primary mt-3">
              Create Your First Listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
