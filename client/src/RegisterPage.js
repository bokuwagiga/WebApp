import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import './App.css';

const RegisterPage = ({onRegister}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password, repeat_password: repeatPassword}),
            });

            if (response.ok) {
                navigate('/login');
                const data = await response.json();
                onRegister(data);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Registration failed, enter valid data!');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An unexpected error occurred.');
        }
    };

    return (
        <div className="login-page">
            <header className="header">
                <h1 className="register-title">Register</h1>
            </header>
            {/* Display the error message */}
            {errorMessage && (
                <div className="error-message">
                    <p className="delete-button">{errorMessage}</p>
                </div>
            )}

            <div className="register-input-group">
                <label className="register-label">Username:</label><br></br>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="login-input"
                />
            </div>
            <br></br>
            <div className="register-input-group">
                <label className="register-label">Password:</label><br></br>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="login-input"
                />
            </div>
            <br></br>
            <div className="register-input-group">
                <label className="register-label">Repeat Password:</label><br></br>
                <input
                    type="password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="repeat password"
                    className="login-input"
                />
            </div>
            <br></br>
            <button onClick={handleRegister} className="register-button">
                Register
            </button>
                <Link to="/login" className="button">
                    <button>Login</button>
                </Link>
        </div>
    );
};

export default RegisterPage;
