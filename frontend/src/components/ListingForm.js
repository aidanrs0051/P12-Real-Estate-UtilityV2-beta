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
  
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
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
    e.preventDefault();
    
    const files = Array.from(e.target.files);
    
    // Limit to 5 images total
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }
    
    // Create previews for each new image
    const newImagePreviews = [...imagePreviewUrls];
    const newImages = [...images];
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Only image files are allowed');
        return;
      }
      
      // Add to images array
      newImages.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviews.push(reader.result);
        setImagePreviewUrls([...newImagePreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    setImages(newImages);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const newImagePreviewUrls = [...imagePreviewUrls];
    
    newImages.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newImagePreviewUrls);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to create a listing');
        setLoading(false);
        return;
      }
      
      // Create a FormData object to send the form data and files
      const data = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Add images
      images.forEach(image => {
        data.append('images', image);
      });
      
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
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Property Details</h5>
              </div>
              <div className="card-body">
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
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Property Images</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Upload Images (Max 5)*</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    multiple
                  />
                  <small className="text-muted">First image will be the primary image</small>
                </div>
                
                {imagePreviewUrls.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Image Previews:</label>
                    <div className="row g-2">
                      {imagePreviewUrls.map((preview, index) => (
                        <div key={index} className="col-6 position-relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail" 
                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeImage(index)}
                          >
                            &times;
                          </button>
                          {index === 0 && (
                            <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading || images.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Listing...
                  </>
                ) : 'Create Listing'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
