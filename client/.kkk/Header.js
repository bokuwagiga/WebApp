// Header.js
import React from 'react';
import {Link} from 'react-router-dom';

const Header = ({token, decodedToken, handleLogout}) => {
    return (
        <header className="header">
            <div>
                <Link to="/posts" className="button">
                    <button>Posts</button>
                </Link>

                <Link to={token ? `/users/${decodedToken.user_id}` : '/login'} className="button">
                    <button>My Profile</button>
                </Link>

            </div>
            <div>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
