// MainApp.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './pages/App';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostPage from './pages/PostPage';
import PrivateRoute from './PrivateRoute';
import CommentPage from './pages/CommentPage';
import UserPostsPage from './pages/UserPostsPage';

const MainApp = () => {
    const [token, setToken] = useState(sessionStorage.getItem('token') || '');

    return (
        <Routes>
            <Route path="/login" element={<LoginPage onLogin={setToken} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/posts" element={
                <PrivateRoute token={token}>
                    <App />
                </PrivateRoute>
            }/>
            <Route path="/users/:userId" element={
                <PrivateRoute token={token}>
                    <UserProfilePage token={token} />
                </PrivateRoute>
            }/>
            <Route path="/posts/:post_id" element={
                <PrivateRoute token={token}>
                    <PostPage token={token} />
                </PrivateRoute>
            }/>
            <Route path="/comments/:comment_id" element={
                <PrivateRoute token={token}>
                    <CommentPage token={token} />
                </PrivateRoute>
            }/>
            <Route path="/users/:userId/posts" element={
                <PrivateRoute token={token}>
                    <UserPostsPage token={token} />
                </PrivateRoute>
            }/>
            <Route path="/" element={<App />} />
        </Routes>
    );
};

export default MainApp;
