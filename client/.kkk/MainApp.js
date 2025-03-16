// MainApp.js

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import UserProfile from './UserProfile';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PostPage from './PostPage';
import Home from './Home';
import CommentPage from './CommentPage';
import UserPosts from './UserPosts';

import './App.css';

const MainApp = () => {
    const [token, setToken] = useState(null);
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
            <Route path="/users/:userId" element={<UserProfile token={storedToken || token} />} />
            <Route path="/posts/:post_id" element={<PostPage token={storedToken || token} />} />
            <Route path="/comments/:comment_id" element={<CommentPage token={storedToken || token} />} />
            <Route path="/users/:userId/posts" element={<UserPosts token={storedToken || token} />} />
        </Routes>
    );
};

export default MainApp;