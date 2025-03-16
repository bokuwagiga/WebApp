// App.js

import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import LoginPage from './LoginPage';
import Header from './Header';
import {jwtDecode} from 'jwt-decode';
import './App.css';

const App = () => {
    const [token, setToken] = useState('');
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [decodedToken, setDecodedToken] = useState({});
    const navigate = useNavigate();
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [isCreatePostButtonVisible, setCreatePostButtonVisibility] = useState(true);

    const fetchData = useCallback(async (token) => {
        try {
            const postsResponse = await fetch('/posts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                const postsWithComments = await Promise.all(
                    postsData.map(async (post) => {
                        const commentsResponse = await fetch(`/posts/${post.post_id}/comments`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        if (commentsResponse.ok) {
                            const commentsData = await commentsResponse.json();
                            return {...post, comments: commentsData.comments};
                        } else {
                            console.error('Error fetching comments:', commentsResponse.statusText);
                            return post;
                        }
                    })
                );

                setPosts(postsWithComments);
            } else {
                sessionStorage.removeItem('token');
                navigate('/login');
            }

            const usersResponse = await fetch('/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            } else {
                sessionStorage.removeItem('token');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [navigate]);

    const handleLogin = async (enteredToken) => {
        sessionStorage.setItem('token', enteredToken);
        setToken(enteredToken);

        try {
            const decoded = jwtDecode(enteredToken);
            setDecodedToken(decoded);
            await fetchData(enteredToken);
            navigate('/posts');
        } catch (error) {
            console.error('Error decoding token:', error);
            navigate('/login');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        setToken('');
        navigate('/login');
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchData(storedToken);
            const decoded = jwtDecode(storedToken);
            setDecodedToken(decoded);
        }
    }, [fetchData]);

    const handleCreatePost = async () => {
        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({post_content: newPostContent}),
            });

            if (response.ok) {
                console.log('Post created successfully');
                window.location.reload();
            } else {
                console.error('Failed to create post:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className="container">
            {token ? (
                <>
                    <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>
                    <div className="page-content">
                        <div className="users-container">
                            <h1>Users</h1>
                            {users.length === 0 ? (
                                <p>Loading users...</p>
                            ) : (
                                <ul className="user-list">
                                    {users.map((user) => (
                                        <li key={user.user_id} className="user-item">
                                            <Link to={`/users/${user.user_id}`} className="user-link">
                                                {user.username}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="posts-container" style={{width: "100%"}}>
                            <div className="posts-header">
                                <h1>Posts</h1>
                                <button
                                    onClick={() => {
                                        setShowCreatePostForm(true);
                                        setCreatePostButtonVisibility(false);
                                    }}
                                    className={`post-button ${isCreatePostButtonVisible ? '' : 'hidden'}`}
                                >
                                    Create A New Post
                                </button>
                            </div>


                            {showCreatePostForm && (
                                <div className="create-post-form">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Enter your post content here..."
                                        className="create-post-textarea"
                                    />
                                    <button onClick={handleCreatePost} className="post-button">
                                        Post
                                    </button>
                                    <button onClick={() => setShowCreatePostForm(false)} className="post-button">
                                        Cancel
                                    </button>
                                </div>
                            )}

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
                                            {post.comments && post.comments.length === 0 ? (
                                                <p>No comments yet.</p>
                                            ) : (
                                                <ul className="comments-list">
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.comment_id} className="comment-item">
                                                            <Link
                                                                to={`/users/${comment.user_id}`}
                                                                className="user-link"
                                                            >
                                                                {comment.user}:
                                                            </Link>
                                                            <Link to={`/comments/${comment.comment_id}`}
                                                                  className="comment-link">
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
                </>
            ) : (
                <LoginPage onLogin={handleLogin}/>
            )}
        </div>
    );
};

export default App;