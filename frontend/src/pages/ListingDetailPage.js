import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAgent } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        setLoading(true);
        
        // Fetch listing details
        const listingResponse = await fetch(`${API_URL}/listings/${id}`);
        
        if (!listingResponse.ok) {
          throw new Error('Listing not found');
        }
        
        const listingData = await listingResponse.json();
        setListing(listingData);
        
        // Fetch listing images
        const imagesResponse = await fetch(`${API_URL}/listings/${id}/images`);
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setImages(imagesData);
          
          // Set active image to the primary image if exists
          const primaryIndex = imagesData.findIndex(img => img.isPrimary === 1);
          if (primaryIndex !== -1) {
            setActiveImage(primaryIndex);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [id, API_URL]);

  const toggleListingStatus = async () => {
    try {
      setStatusLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to change listing status');
        return;
      }
      
      // Determine new status (toggle between active and inactive)
      const newStatus = listing.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`${API_URL}/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing status');
      }
      
      // Update the listing in state
      setListing({ ...listing, status: newStatus });
      
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to change primary image');
        return;
      }
      
      const response = await fetch(`${API_URL}/listings/${id}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update primary image');
      }
      
      // Update images state to reflect the new primary image
      setImages(images.map(img => ({
        ...img,
        isPrimary: img.id === imageId ? 1 : 0
      })));
      
    } catch (err) {
      console.error('Error setting primary image:', err);
      setError(err.message);
    }
  };

  const deleteImage = async (imageId) => {
    // Don't allow deleting if there's only one image
    if (images.length <= 1) {
      setError('Listing must have at least one image');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to delete images');
        return;
      }
      
      const response = await fetch(`${API_URL}/listings/${id}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
      
      // Remove image from state
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      
      // Reset active image if needed
      if (activeImage >= newImages.length) {
        setActiveImage(newImages.length - 1);
      }
      
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message);
    }
  };

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

  // Check if the current user is an agent and can modify this listing
  const canModifyListing = user && isAgent && user.role === 'agent';

  return (
    <div className="container py-5">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-8">
          {/* Image Gallery */}
          <div className="mb-4">
            <div className="position-relative">
              {images.length > 0 ? (
                <img 
                  src={`${API_URL}/listings/${id}/images/${images[activeImage].id}`} 
                  alt={`Property at ${listing.address}`}
                  className="img-fluid rounded mb-2"
                  style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img 
                  src="/api/placeholder/800/600"
                  alt={`Property at ${listing.address}`}
                  className="img-fluid rounded mb-2"
                />
              )}
              
              {/* Image navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
                    onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button 
                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="row g-2 mt-2">
                {images.map((image, index) => (
                  <div key={image.id} className="col-2">
                    <div 
                      className={`position-relative thumbnail-container ${index === activeImage ? 'active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveImage(index)}
                    >
                      <img 
                        src={`${API_URL}/listings/${id}/images/${image.id}`}
                        alt={`Thumbnail ${index + 1}`}
                        className={`img-thumbnail ${index === activeImage ? 'border-primary' : ''}`}
                        style={{ height: '60px', objectFit: 'cover', width: '100%' }}
                      />
                      {image.isPrimary === 1 && (
                        <span className="badge bg-primary position-absolute bottom-0 end-0 m-1">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image Management (for agents) */}
            {canModifyListing && images.length > 0 && (
              <div className="mt-3 d-flex flex-wrap">
                <button 
                  className="btn btn-sm btn-outline-primary me-2 mb-2"
                  onClick={() => setPrimaryImage(images[activeImage].id)}
                  disabled={images[activeImage].isPrimary === 1}
                >
                  Set as Primary Image
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger me-2 mb-2"
                  onClick={() => deleteImage(images[activeImage].id)}
                  disabled={images.length <= 1}
                >
                  Delete Image
                </button>
                <label className="btn btn-sm btn-outline-secondary mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={async (e) => {
                      // Handle adding a new image
                      if (images.length >= 5) {
                        setError('Maximum of 5 images allowed per listing');
                        return;
                      }
                      
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append('image', file);
                      
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_URL}/listings/${id}/images`, {
                          method: 'POST',
                          headers: {
                            'x-auth-token': token
                          },
                          body: formData
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to upload image');
                        }
                        
                        const newImage = await response.json();
                        setImages([...images, newImage]);
                        setActiveImage(images.length);
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  />
                  Add Image {images.length}/5
                </label>
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">{listing.title || listing.address}</h1>
            
            {/* Status badge */}
            <span className={`badge ${listing.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
              {listing.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
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
            
            {/* Toggle status button - only visible to agents who own the listing or managers */}
            {canModifyListing && (
              <button 
                className={`btn ${listing.status === 'active' ? 'btn-warning' : 'btn-success'} me-2`}
                onClick={toggleListingStatus}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  listing.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'
                )}
              </button>
            )}
            
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
                <li className="list-group-item d-flex justify-content-between">
                  <span>Status:</span>
                  <span className={`text-${listing.status === 'active' ? 'success' : 'secondary'}`}>
                    {listing.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {listing.status === 'active' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
                        