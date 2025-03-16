// MainApp.js

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './pages/App';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostPage from './pages/PostPage';
import Home from './pages/Home';
import CommentPage from './pages/CommentPage';
import UserPostsPage from './pages/UserPostsPage';

import './styles/App.css';

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
            <Route path="/users/:userId" element={<UserProfilePage token={storedToken || token} />} />
            <Route path="/posts/:post_id" element={<PostPage token={storedToken || token} />} />
            <Route path="/comments/:comment_id" element={<CommentPage token={storedToken || token} />} />
            <Route path="/users/:userId/posts" element={<UserPostsPage token={storedToken || token} />} />
        </Routes>
    );
};

export default MainApp;