import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isManager } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Memoize fetchUsers with useCallback
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]); // API_URL is the only external dependency

  useEffect(() => {
    // Redirect if not manager
    if (isAuthenticated && !isManager()) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, isManager, navigate, fetchUsers]); // Add fetchUsers to dependencies

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (error) {
      setError('Error updating role: ' + error.message);
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

  return (
    <div className="container py-5">
      <h1 className="mb-4">User Management</h1>
      
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">All Users</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'manager' ? 'bg-danger' : 
                      user.role === 'agent' ? 'bg-success' : 
                      'bg-secondary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-select form-select-sm"
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                    >
                      <option value="default">Regular User</option>
                      <option value="agent">Agent</option>
                      <option value="manager">Manager</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
