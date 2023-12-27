// MainApp.js

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import UserProfile from './UserProfile';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PostPage from './PostPage';
import Home from './Home';
import CommentPage from './CommentPage';  // Make sure the import statement is correct
import './App.css';

const MainApp = () => {
  const [enteredToken, setToken] = useState(null);

  const storedToken = sessionStorage.getItem('token');

  const handleLogin = (enteredToken) => {
    setToken(enteredToken);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/posts" element={<App />} />
      <Route path="/" element={<Home />} />
      <Route path="/users/:userId" element={<UserProfile token={storedToken} />} />
      <Route path="/posts/:post_id" element={<PostPage token={storedToken} />} />
      <Route path="/comments/:comment_id" element={<CommentPage token={storedToken} />} />
    </Routes>
  );
};

export default MainApp;
