import React from 'react';
import { Link } from 'react-router-dom';

const ListingsGrid = ({ title, listings }) => {
  return (
    <div className="listings-section py-4">
      <h2 className="mb-4">{title}</h2>
      <div className="row">
        {listings.map(listing => (
          <div key={listing.id} className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100 shadow-sm">
              <img 
                src={listing.imageUrl} 
                className="card-img-top" 
                alt={`Property at ${listing.address}`} 
              />
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