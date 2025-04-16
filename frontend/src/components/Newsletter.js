import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle email subscription
    console.log('Newsletter subscription for:', email);
    setIsSubmitted(true);
    setEmail('');
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="newsletter-section bg-secondary text-white p-4 p-md-5 rounded my-4">
      <div className="row align-items-center">
        <div className="col-lg-8">
          <h3>Stay Updated on New Listings</h3>
          <p>Subscribe to our newsletter to receive the latest property listings and real estate news.</p>
        </div>
        <div className="col-lg-4">
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={isSubmitted}
              >
                Subscribe
              </button>
            </div>
            {isSubmitted && (
              <div className="alert alert-success mt-2 py-1 px-2">
                Thank you for subscribing!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;