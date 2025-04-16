import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [savedListings, setSavedListings] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          return;
        }
        
        // Fetch saved listings
        const savedListingsRes = await fetch('http://localhost:5000/api/users/saved-listings', {
          headers: {
            'x-auth-token': token
          }
        });
        
        // Fetch user activity
        const userActivityRes = await fetch('http://localhost:5000/api/users/activity', {
          headers: {
            'x-auth-token': token
          }
        });
        
        const savedListingsData = await savedListingsRes.json();
        const userActivityData = await userActivityRes.json();
        
        setSavedListings(savedListingsData);
        setUserActivity(userActivityData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Rest of the dashboard component...
};