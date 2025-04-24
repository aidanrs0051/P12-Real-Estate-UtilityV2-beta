import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-bottom text-center">
          <p>&copy; {new Date().getFullYear()} Rocket City Realty Team Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;