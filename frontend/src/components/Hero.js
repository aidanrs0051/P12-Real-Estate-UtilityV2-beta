import React from 'react';
import hero_banner from '../hero_banner.jpg';

const Hero = () => {
  return (
    <div className="hero-section bg-primary text-white py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold">Find Your Dream Home</h1>
            <p className="lead">Discover the perfect property with Rocket City Realty</p>
            <form className="mt-4">
              <div className="input-group mb-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Enter location, ZIP or address..." 
                />
                <button className="btn btn-secondary" type="button">Search</button>
              </div>
            </form>
          </div>
          <div className="col-lg-6">
            <img 
              src={hero_banner}
              alt="Beautiful home" 
              className="img-fluid rounded shadow" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;