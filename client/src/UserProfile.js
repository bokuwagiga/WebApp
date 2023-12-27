//UserProfile.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import './App.css';
import { jwtDecode } from 'jwt-decode';

const UserProfile = ({ token }) => {
  const [decodedToken, setDecodedToken] = useState({});
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode(storedToken);
      setDecodedToken(decoded);
    }
  }, []);

  return (
    <div className="container">
      <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout} />
      <div className="user-profile">
        <h1>User Profile</h1>
        {loading ? (
          <p className="loading-message">Loading user profile...</p>
        ) : userData ? (
          <div className="profile-info">
            <p>User ID: {userData.user_id}</p>
            <p>Username: {userData.username}</p>
          </div>
        ) : (
          <p className="error-message">Failed to load user profile.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
