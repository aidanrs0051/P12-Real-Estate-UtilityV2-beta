import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/listings');
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (type) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${type === 'open' ? 'Open' : 'Closed'} Listings Report`,
          type: type,
          dateRange: 'last30days',
          format: 'pdf'
        }),
      });
      
      const data = await response.json();
      
      setAlertMessage(`${type === 'open' ? 'Open' : 'Closed'} listing report generated successfully!`);
      
      // Auto-dismiss alert after 3 seconds
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      setAlertMessage('Error generating report');
    } finally {
      setIsLoading(false);
    }
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
      
      <div className="mb-4">
        <button 
          id="openListingBtn" 
          className="btn btn-primary me-2" 
          onClick={() => generateReport('open')}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ms-2">Generating...</span>
            </>
          ) : (
            'Generate Open Listings Report'
          )}
        </button>
        
        <button 
          id="closedListingBtn" 
          className="btn btn-secondary" 
          onClick={() => generateReport('closed')}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ms-2">Generating...</span>
            </>
          ) : (
            'Generate Closed Listings Report'
          )}
        </button>
      </div>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {listings.map(listing => (
          <div className="col" key={listing.id}>
            <div className="card listing-card h-100">
              <Link to={`/listing/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="card-img-top" 
                  style={{ 
                    height: '200px', 
                    background: `url(${listing.imageUrl}) center/cover no-repeat`
                  }}
                ></div>
                <div className="card-body">
                  <h5 className="card-title">{listing.price}</h5>
                  <p className="card-text">
                    {listing.address}<br />
                    {listing.beds} beds | {listing.baths} baths | {listing.sqft} sqft
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsPage;