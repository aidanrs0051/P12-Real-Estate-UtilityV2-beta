import React, { useState } from 'react';

const Filters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    propertyType: 'any'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <div className="filters-section bg-light p-4 rounded mb-4">
      <h3 className="mb-3">Filter Properties</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Min Price</label>
            <select 
              className="form-select" 
              name="minPrice" 
              value={filters.minPrice} 
              onChange={handleChange}
            >
              <option value="">Any</option>
              <option value="200000">$200,000</option>
              <option value="300000">$300,000</option>
              <option value="400000">$400,000</option>
              <option value="500000">$500,000</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Max Price</label>
            <select 
              className="form-select" 
              name="maxPrice" 
              value={filters.maxPrice} 
              onChange={handleChange}
            >
              <option value="">Any</option>
              <option value="400000">$400,000</option>
              <option value="600000">$600,000</option>
              <option value="800000">$800,000</option>
              <option value="1000000">$1,000,000+</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Beds</label>
            <select 
              className="form-select" 
              name="beds" 
              value={filters.beds} 
              onChange={handleChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Baths</label>
            <select 
              className="form-select" 
              name="baths" 
              value={filters.baths} 
              onChange={handleChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Property Type</label>
            <select 
              className="form-select" 
              name="propertyType" 
              value={filters.propertyType} 
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">Apply Filters</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Filters;