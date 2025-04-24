import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout, isManager } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'var(--custom-light-purple)' }}>
        <div className="container">
          <Link className="navbar-brand" to="/">Rocket City Realty</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item px-2">
                <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/">Home</NavLink>
              </li>
              <li className="nav-item px-2">
                <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/listings">Listings</NavLink>
              </li>
              {isAuthenticated && isManager() && (
                <>
                  <li className="nav-item px-2">
                    <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/reports">Reports</NavLink>
                  </li>
                </>
              )}
              <li className="nav-item px-2">
                    <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/dashboard">Dashboard</NavLink>
              </li>
            </ul>
            <div className="ms-3 user-actions d-none d-lg-flex">
              {isAuthenticated ? (
                <div className="d-flex align-items-center">
                  <span className="me-3 text-light">Welcome, {user?.firstName}</span>
                  <button className="btn btn-light" style={{ color: 'var(--custom-dark-purple)' }} onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <>
                  <button className="btn btn-primary me-2" onClick={() => navigate('/login')}>Log In</button>
                  <button className="btn btn-light" style={{ color: 'var(--custom-dark-purple)' }} onClick={() => navigate('/register')}>Sign Up</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
