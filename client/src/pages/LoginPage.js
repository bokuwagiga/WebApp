// LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import Button from '../components/Button';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('token', data.token);

                if (typeof onLogin === 'function') {
                    onLogin(data.token);
                }

                navigate('/posts');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
                setError(errorData.message || `Login failed: ${response.statusText}`);
            }
        } catch (error) {
            setError('Network error. Please try again later.');
            console.error('Error during login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <header className="header">
                <h1>Login</h1>
            </header>
            {error && <div className="error-message">{error}</div>}
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="login-input"
                    disabled={isLoading}
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="password"
                    className="login-input"
                    disabled={isLoading}
                />
            </div>
            <Button
                onClick={handleLogin}
                className="login-button"
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
                onClick={handleRegisterClick}
                className="register-button"
                disabled={isLoading}
            >
                Register
            </Button>
        </div>
    );
};

export default LoginPage;