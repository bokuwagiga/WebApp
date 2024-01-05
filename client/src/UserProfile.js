import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Header from './Header';
import './App.css';
import {jwtDecode} from 'jwt-decode';

const UserProfile = ({token}) => {
    const [decodedToken, setDecodedToken] = useState({});
    const {userId} = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [isEditing, setEditing] = useState(false);
    const [isChangingPassword, setChangingPassword] = useState(false);
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
                    setEditedUsername(userData.username); // Set the initial edited username
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


    const handleEditProfile = () => {
        // Set isChangingPassword to true to render the new password fields
        setEditing(false); // Ensure we are not in the main profile editing
        setChangingPassword(true);
    };

    const handleSaveEdit = async () => {
        try {
            const bodyData = {username: editedUsername, password: editedPassword};

            if (isChangingPassword) {
                bodyData.new_password = newPassword;
                bodyData.repeat_new_password = repeatNewPassword;
            }

            const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bodyData),
            });

            if (response.ok) {
                setEditing(false);
                setChangingPassword(false);
                window.location.reload();
            } else {
                console.error('Error updating user profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    const handleCancelEdit = () => {
        // Reset isEditing and isChangingPassword states without saving the edit
        setEditing(false);
        setChangingPassword(false);
        setEditedUsername('');
        setEditedPassword('');
        setNewPassword('');
        setRepeatNewPassword('');
    };

    const handleDeleteProfile = async () => {
        try {
            const shouldDelete = window.confirm('Are you sure you want to delete your profile?');

            if (shouldDelete) {
                const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    navigate('/login');
                } else {
                    console.error('Error deleting user profile:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Error deleting user profile:', error);
        }
    };

    return (
        <div className="container">
            <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>
            <div className="user-profile">
                <h1>User Profile</h1>
                {loading ? (
                    <p className="loading-message">Loading user profile...</p>
                ) : userData ? (
                    <div className="profile-info">
                        {isEditing || isChangingPassword ? (
                            <div className="edit-profile-form">
                                {isChangingPassword && (
                                    <>
                                        <div>
                                                            <label>Username:</label>

                                        <input
                                            className="login-input"
                                            type="text"
                                            value={editedUsername}
                                            onChange={(e) => setEditedUsername(e.target.value)}
                                            placeholder="Username..."
                                        />
                                        </div>
                                        <div>
                                                            <label>Password:</label>

                                        <input
                                            className="login-input"
                                            type="password"
                                            value={editedPassword}
                                            onChange={(e) => setEditedPassword(e.target.value)}
                                            placeholder="Password..."
                                        />
                                        </div>
                                        <div>
                                                            <label>New Password (Optional):</label>

                                        <input
                                            className="login-input"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password..."
                                        />
                                        </div>
                                        <div>
                                            <label>Repeat New Password:</label>
                                        <input
                                            className="login-input"
                                            type="password"
                                            value={repeatNewPassword}
                                            onChange={(e) => setRepeatNewPassword(e.target.value)}
                                            placeholder="Repeat new password..."
                                        />
                                        </div>
                                    </>
                                )}

                                <button onClick={handleSaveEdit} className="post-button">
                                    Save
                                </button>
                                <button onClick={handleCancelEdit} className="post-button">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <p>User ID: {userData.user_id}</p>
                                <p>Username: {userData.username}</p>
                                {(decodedToken.user_id === userData.user_id || decodedToken.is_admin) && (
                                    <>
                                        <button onClick={handleEditProfile} className="post-button">
                                            Edit Profile
                                        </button>
                                        <button onClick={handleDeleteProfile} className="delete-button">
                                            Delete Profile
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <p className="error-message">Failed to load user profile.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
