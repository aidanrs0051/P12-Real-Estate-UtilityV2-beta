import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListingsGrid = ({ title, listings }) => {
  const [listingImages, setListingImages] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch primary images for all listings
    const fetchPrimaryImages = async () => {
      const imageData = {};
      
      for (const listing of listings) {
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

    if (listings && listings.length > 0) {
      fetchPrimaryImages();
    }
  }, [listings, API_URL]);

  return (
    <div className="listings-section py-4">
      <h2 className="mb-4">{title}</h2>
      <div className="row">
        {listings.map(listing => (
          <div key={listing.id} className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100 shadow-sm">
              {/* Use primary image if available, otherwise fallback to default image */}
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
                  src={listing.imageUrl || '/api/placeholder/300/200'} 
                  className="card-img-top" 
                  alt={`Property at ${listing.address}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title fw-bold">{listing.price}</h5>
                <p className="card-text text-muted small">{listing.address}</p>
                <div className="d-flex justify-content-between">
                  <span><i className="bi bi-door-closed"></i> {listing.beds} beds</span>
                  <span><i className="bi bi-droplet"></i> {listing.baths} baths</span>
                  <span><i className="bi bi-rulers"></i> {listing.sqft} sqft</span>
                </div>
              </div>
              <div className="card-footer bg-white">
                <Link to={`/listings/${listing.id}`} className="btn btn-sm btn-outline-primary w-100">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-3">
        <Link to="/listings" className="btn btn-outline-primary">View All Listings</Link>
      </div>
    </div>
  );
};

export default ListingsGrid;
