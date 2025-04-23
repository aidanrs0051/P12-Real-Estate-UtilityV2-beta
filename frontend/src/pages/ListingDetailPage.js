import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [error, setError] = useState(null);
  const { user, isAgent } = useContext(AuthContext);
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
        // Initialize form data with current listing data
        setEditFormData({
          title: data.title || '',
          price: data.price || '',
          address: data.address || '',
          beds: data.beds || '',
          baths: data.baths || '',
          sqft: data.sqft || '',
          propertyType: data.propertyType || '',
          description: data.description || ''
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit listings');
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }
      
      const updatedListing = await response.json();
      setListing(updatedListing);
      setIsEditing(false);
      setError(null);
      
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data and exit edit mode
    setEditFormData({
      title: listing.title || '',
      price: listing.price || '',
      address: listing.address || '',
      beds: listing.beds || '',
      baths: listing.baths || '',
      sqft: listing.sqft || '',
      propertyType: listing.propertyType || '',
      description: listing.description || ''
    });
    setIsEditing(false);
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

  // Render edit form or listing details based on isEditing state
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
          <img 
            src={`${API_URL}/listings/${id}/image`} 
            alt={listing.address}
            className="img-fluid rounded mb-4"
            onError={(e) => {
              e.target.src = '/api/placeholder/800/600';
              e.target.onerror = null;
            }}
          />
          
          {isEditing ? (
            // Edit Form
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">Edit Listing</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={editFormData.title}
                      onChange={handleInputChange}
                      placeholder="Property Title"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={editFormData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="price" className="form-label">Price</label>
                      <input
                        type="text"
                        className="form-control"
                        id="price"
                        name="price"
                        value={editFormData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="propertyType" className="form-label">Property Type</label>
                      <select
                        className="form-select"
                        id="propertyType"
                        name="propertyType"
                        value={editFormData.propertyType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select property type</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="apartment">Apartment</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="beds" className="form-label">Beds</label>
                      <input
                        type="number"
                        className="form-control"
                        id="beds"
                        name="beds"
                        value={editFormData.beds}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="baths" className="form-label">Baths</label>
                      <input
                        type="number"
                        className="form-control"
                        id="baths"
                        name="baths"
                        value={editFormData.baths}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="sqft" className="form-label">Square Feet</label>
                      <input
                        type="text"
                        className="form-control"
                        id="sqft"
                        name="sqft"
                        value={editFormData.sqft}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleInputChange}
                      rows="5"
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            // View Mode
            <>
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
                
                {/* Edit button - only visible to agents who own the listing or managers */}
                {canModifyListing && (
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Listing
                  </button>
                )}
                
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
            </>
          )}
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
                <li className="list-group-item d-flex justify-content-between">
                  <span>Listed By:</span>
                  <span className="text-muted">{listing.agentName || 'Agent'}</span>
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
