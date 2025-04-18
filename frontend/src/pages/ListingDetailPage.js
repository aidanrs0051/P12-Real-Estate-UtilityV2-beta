import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/listings/${id}`);
        
        if (!response.ok) {
          throw new Error('Listing not found');
        }
        
        const data = await response.json();
        setListing(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Listing not found'}
        </div>
        <Link to="/listings" className="btn btn-primary">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <img 
            src={`${API_URL}/listings/${id}/image`} 
            alt={listing.address}
            className="img-fluid rounded mb-4"
            onError={(e) => {
              e.target.src = '/api/placeholder/800/600';
              e.target.onerror = null;
            }}
          />
          
          <h1 className="mb-3">{listing.title || listing.address}</h1>
          <h3 className="text-primary mb-3">${listing.price}</h3>
          
          <div className="d-flex mb-4">
            <div className="me-4">
              <i className="bi bi-door-closed me-2"></i>
              {listing.beds} beds
            </div>
            <div className="me-4">
              <i className="bi bi-droplet me-2"></i>
              {listing.baths} baths
            </div>
            <div>
              <i className="bi bi-rulers me-2"></i>
              {listing.sqft} sqft
            </div>
          </div>
          
          <h4>Description</h4>
          <p>{listing.description || 'No description available.'}</p>
          
          <div className="mt-4">
            <Link to="/" className="btn btn-outline-primary me-2">
              Back to Listings
            </Link>
            <button className="btn btn-primary">
              Contact Agent
            </button>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Property Details</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Address:</span>
                  <span className="text-muted">{listing.address}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Property Type:</span>
                  <span className="text-muted">{listing.propertyType}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Schedule a Tour</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="tourDate" className="form-label">Date</label>
                  <input type="date" className="form-control" id="tourDate" />
                </div>
                <div className="mb-3">
                  <label htmlFor="tourTime" className="form-label">Time</label>
                  <select className="form-select" id="tourTime">
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Schedule Tour
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
