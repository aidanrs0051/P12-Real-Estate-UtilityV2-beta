import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignupPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'default'
    });

    // Error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register, isAuthenticated, isManager } = useContext(AuthContext);

    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    // Handle input changes
    const handleChange = e => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async e => {
      e.preventDefault();
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Create user object without confirmPassword
      const userData = {
        firstName,
        lastName,
        email,
        password,
        role
      };
      
      const result = await register(userData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
      
      setLoading(false);
    };

    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0">Create an Account</h2>
              </div>
              <div className="card-body p-4">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <small className="form-text text-muted">Password must be at least 6 characters</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>
                  {isAuthenticated && isManager() && (
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">User Role</label>
                      <select
                        className="form-select"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="default">Regular User</option>
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3">
                <p className="mb-0">Already have an account? <a href="/login" className="text-decoration-none">Log In</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default SignupPage;
