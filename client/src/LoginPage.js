//LoginPage.js

import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './App.css';

const LoginPage = ({onLogin, onRegister}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleRegisterClick = () => {
        navigate('/register');
    };
    const handleLogin = async () => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            if (response.ok) {
                navigate('/posts');
                const data = await response.json();
                sessionStorage.setItem('token', data.token);
                onLogin(data.token);
                window.location.reload();
            } else {
                console.error('Login failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="login-page">
            <header className="header">
                <h1>Login</h1>
            </header>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="login-input"
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="login-input"
                />
            </div>
            <button onClick={handleLogin} className="login-button">
                Login
            </button>
            <button onClick={handleRegisterClick} className="register-button">
                Register
            </button>
        </div>
    );
};

export default LoginPage;