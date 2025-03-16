import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/App.css';
import { jwtDecode } from "jwt-decode";
import Posts from "../components/Posts";
import usePagination from '../hooks/usePagination';

const UserPostsPage = ({ token }) => {
  const [decodedToken, setDecodedToken] = useState({});
  const { userId } = useParams();
  const navigate = useNavigate();

  const fetchUserPosts = async (page, perPage) => {
    if (!userId || !token) return null;

    const response = await fetch(
      `http://127.0.0.1:5000/users/${userId}/posts?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user posts');
    }

    return await response.json();
  };

  const {
    data: posts,
    pagination,
    error,
    fetchData: loadPosts,
    handlePageChange
  } = usePagination(fetchUserPosts);

  useEffect(() => {
    if (userId && token) {
      loadPosts(1);
    }
  }, [userId, token, loadPosts]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode(storedToken);
      setDecodedToken(decoded);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout} />
      <div className="posts-container">
        <h1>User Posts</h1>

        {error && <div className="error-message">{error}</div>}

        <Posts
          posts={posts}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default UserPostsPage;