import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, isAuthenticated, isManager, isAgent } = useContext(AuthContext);
  const [savedListings, setSavedListings] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch user-specific data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // Fetch saved listings
        const savedListingsRes = await fetch(`${API_URL}/users/saved-listings`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        // Fetch user activity
        const userActivityRes = await fetch(`${API_URL}/users/activity`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!savedListingsRes.ok || !userActivityRes.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const savedListingsData = await savedListingsRes.json();
        const userActivityData = await userActivityRes.json();
        
        setSavedListings(savedListingsData);
        setUserActivity(userActivityData);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        //setError('Error loading your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, API_URL]);

  if (!isAuthenticated) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          You must be logged in to view your dashboard.
        </div>
        <Link to="/login" className="btn btn-primary mt-3">Log In</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {error} {/*Shut up compiler*/}
      {/*error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )*/}
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <h2 className="h5">Welcome back,</h2>
              <h1 className="h3 mb-3">{user?.firstName} {user?.lastName}</h1>
              <p className="text-muted">{user?.email}</p>
              <p>
                <span className={`badge ${
                  user?.role === 'manager' ? 'bg-danger' : 
                  user?.role === 'agent' ? 'bg-success' : 
                  'bg-secondary'
                } me-2`}>
                  {user?.role === 'manager' ? 'Manager' : 
                   user?.role === 'agent' ? 'Agent' : 
                   'User'}
                </span>
              </p>
              <button className="btn btn-outline-primary mt-2">Edit Profile</button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">Quick Links</div>
            <div className="list-group list-group-flush">
              {isAgent() && !isManager() && (
                <Link to="/listings/new" className="list-group-item list-group-item-action">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Listing
                </Link>
              )}
              
              {isManager() && (
                <Link to="/admin/users" className="list-group-item list-group-item-action">
                  <i className="bi bi-people me-2"></i>
                  User Management
                </Link>
              )}
              
              {isManager() && (
                <>
                  <Link to="/reports?type=open" className="list-group-item list-group-item-action">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Open Listings Report
                  </Link>
                  <Link to="/reports?type=closed" className="list-group-item list-group-item-action">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Closed Listings Report
                  </Link>
                </>
              )}
              
              <Link to="/settings" className="list-group-item list-group-item-action">
                <i className="bi bi-gear me-2"></i>
                Account Settings
              </Link>
            </div>
          </div>
          
          {isAgent() && (
            <div className="card mt-4">
              <div className="card-header">Agent Stats</div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col">
                    <h3>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        savedListings.filter(l => l.status === 'active').length
                      )}
                    </h3>
                    <p className="text-muted">Active Listings</p>
                  </div>
                  <div className="col">
                    <h3>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        savedListings.filter(l => l.status !== 'active').length
                      )}
                    </h3>
                    <p className="text-muted">Closed Deals</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Saved Listings</h5>
              <Link to="/listings" className="btn btn-sm btn-primary">View All Listings</Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : savedListings.length > 0 ? (
                <div className="list-group">
                  {savedListings.map(listing => (
                    <Link 
                      key={listing.id}
                      to={`/listings/${listing.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{listing.address}</h6>
                        <p className="mb-0 text-muted">Price: {listing.price}</p>
                      </div>
                      <span className="badge bg-primary rounded-pill">View</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center mb-0">You haven't saved any listings yet.</p>
              )}
            </div>
            {savedListings.length > 0 && (
              <div className="card-footer bg-white text-center">
                <Link to="/saved-listings" className="btn btn-link">View All Saved Listings</Link>
              </div>
            )}
          </div>
          
          <div className="card">
            <div className="card-header">Recent Activity</div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : userActivity.length > 0 ? (
                <div className="timeline">
                  {userActivity.map((activity, index) => (
                    <div key={index} className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-date text-muted me-3" style={{ minWidth: '100px' }}>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                        <div className="timeline-content">
                          <p className="mb-0">{activity.description}</p>
                        </div>
                      </div>
                      {index < userActivity.length - 1 && <hr className="my-2" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center mb-0">No recent activity found.</p>
              )}
            </div>
          </div>
          
          {isManager() && (
            <div className="card mt-4">
              <div className="card-header">Management Tools</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-grid">
                      <Link to="/reports" className="btn btn-outline-primary">
                        <i className="bi bi-file-earmark-bar-graph me-2"></i>
                        Report Center
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-grid">
                      <Link to="/admin/users" className="btn btn-outline-primary">
                        <i className="bi bi-people me-2"></i>
                        User Management
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
