import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Header from '../components/Header';
import '../styles/App.css';
import {jwtDecode} from "jwt-decode";
import Posts from "../components/Posts";

const UserPostsPage = ({token}) => {
        const [decodedToken, setDecodedToken] = useState({});
        const {userId} = useParams();
        const [posts, setPosts] = useState([]);
        const navigate = useNavigate();

        useEffect(() => {
            const fetchUserPosts = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/users/${userId}/posts`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const postsData = await response.json();
                        console.log('Fetched posts:', postsData); // Debugging output
                        setPosts(postsData);
                    } else {
                        console.error('Failed to fetch posts:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                }
            };

            if (userId && token) {
                fetchUserPosts();
            }
        }, [userId, token]);


        useEffect(() => {
            const storedToken = sessionStorage.getItem('token');
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                setDecodedToken(decoded);
            }
        }, []);


        const handleLogout = () => {
            sessionStorage.removeItem('token');
            navigate('/login');
        };

        return (
            <div className="container">
                <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>
                <div className="posts-container">
                    <h1>Posts</h1>
                    <Posts posts={posts}></Posts>
                </div>
            </div>
        );
    }
;

export default UserPostsPage;
