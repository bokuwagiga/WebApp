import React, {useEffect, useState} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import Header from './Header';
import './App.css';
import {jwtDecode} from "jwt-decode";

const UserPosts = ({token}) => {
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
                {posts.length === 0 ? (
                    <p>Loading posts...</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.post_id} className="post">
                            <div className="post-header">
                                Author:
                                <Link to={`/users/${post.user_id}`} className="user-link">
                                    {post.user}
                                </Link>
                            </div>
                            <div className="post-content">{post.post_content}</div>
                            <div className="comments-section">
                                <h2 className="comments-heading">Comments</h2>
                                {post.comments && Array.isArray(post.comments) && post.comments.length === 0 ? (
                                    <p>No comments yet.</p>
                                ) : (
                                    <ul className="comments-list">
                                        {Array.isArray(post.comments) && post.comments.map((comment) => (
                                            <div key={comment.comment_id} className="comment-item">
                                                <Link to={`/users/${comment.user_id}`} className="user-link">
                                                    {comment.user}:
                                                </Link>
                                                <Link to={`/comments/${comment.comment_id}`} className="comment-link">
                                                    <span>{comment.comment_content}</span>
                                                </Link>
                                            </div>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <Link to={`/posts/${post.post_id}`} className="view-post-button">
                                View Post
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserPosts;
