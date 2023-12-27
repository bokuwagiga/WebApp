import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

// Import statements...

const Home = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/');
                if (response.ok) {
                    const postData = await response.json();
                    setPosts(postData);
                } else {
                    console.error('Failed to fetch posts:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container">
            <header className="header">
                <h1>Home</h1>
                <Link to="/login" className="button">
                    <button>Login</button>
                </Link>
            </header>
            <div className="page-content">
                <div className="post-container">
                    {posts.length === 0 ? (
                        <p className="loading-posts">Loading posts...</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.post_id} className="post">
                                <div className="post-header">
                                    Author:
                                    <Link to={`/login`} className="user-link">
                                        {post.user}
                                    </Link>
                                </div>
                                <h2 className="post-content">{post.post_content}</h2>

                                {post.comments && post.comments.length > 0 ? (
                                    <ul className="comments-list">
                                        {post.comments.map((comment) => (
                                            <li key={comment.comment_id}
                                                className="comment-item">
                                                <Link
                                                    to={`/users/${comment.user_id}`}
                                                    className="user-link">
                                                    {comment.user}:
                                                </Link>{comment.comment_content}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-comments">No comments yet.</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

};

export default Home;
