import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    beds: '',
    baths: '',
    sqft: '',
    propertyType: 'house',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create a FormData object to send the form data and file
      const data = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Add the image if it exists
      if (image) {
        data.append('image', image);
      }
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to create a listing');
      }
      
      // Send the request
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }
      
      const result = await response.json();
      
      // Redirect to the new listing
      navigate(`/listings/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Create New Listing</h1>
      
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Property Details</h5>
                
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Beautiful Family Home"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 123 Main St, Anytown, ST 12345"
                  />
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="price" className="form-label">Price*</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 450,000"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <label htmlFor="beds" className="form-label">Bedrooms*</label>
                    <input
                      type="number"
                      className="form-control"
                      id="beds"
                      name="beds"
                      value={formData.beds}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label htmlFor="baths" className="form-label">Bathrooms*</label>
                    <input
                      type="number"
                      className="form-control"
                      id="baths"
                      name="baths"
                      value={formData.baths}
                      onChange={handleChange}
                      required
                      min="1"
                      step="0.5"
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="sqft" className="form-label">Square Feet*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="sqft"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 2,000"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="propertyType" className="form-label">Property Type*</label>
                    <select
                      className="form-select"
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      required
                    >
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Property Image</h5>
                
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Upload Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                
                {imagePreview && (
                  <div className="mt-3">
                    <h6>Image Preview:</h6>
                    <img 
                      src={imagePreview} 
                      alt="Property Preview" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-end">
          <button 
            type="button" 
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/listings')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
