// Header.js
import React from 'react';
import {Link} from 'react-router-dom';
import Button from './Button';

const Header = ({token, decodedToken, handleLogout}) => {
    return (
        <header className="header">
            <div>
                <Link to="/posts" className="button">
          <Button>Posts</Button>
                </Link>

                <Link to={token ? `/users/${decodedToken.user_id}` : '/login'} className="button">
          <Button>My Profile</Button>
                </Link>

            </div>
            <div>
        <Button className="logout-button" onClick={handleLogout}>
          Logout
        </Button>
            </div>
        </header>
    );
};

export default Header;