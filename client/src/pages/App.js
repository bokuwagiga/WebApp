// App.js
import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Header from '../components/Header';
import {jwtDecode} from 'jwt-decode';
import '../styles/App.css';
import Button from '../components/Button';
import Posts from "../components/Posts";
import usePagination from '../hooks/usePagination';

const App = () => {
    const [token, setToken] = useState('');
    const [users, setUsers] = useState([]);
    const [decodedToken, setDecodedToken] = useState({});
    const navigate = useNavigate();
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [isCreatePostButtonVisible, setCreatePostButtonVisibility] = useState(true);

    const fetchPostsAuth = useCallback(async (page, perPage) => {
        if (!token) return null;

        try {
            const postsResponse = await fetch(`/posts?page=${page}&per_page=${perPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!postsResponse.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await postsResponse.json();
            const postsWithComments = await Promise.all(
                data.posts.map(async (post) => {
                    const commentsResponse = await fetch(`/posts/${post.post_id}/comments`, {
                        headers: {Authorization: `Bearer ${token}`},
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
            return {posts: postsWithComments, pagination: data.pagination};
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }, [token]);

    const fetchPostsPublic = useCallback(async (page, perPage) => {
        try {
            const response = await fetch(`http://localhost:5000/posts?page=${page}&per_page=${perPage}`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            return {posts: data.posts, pagination: data.pagination};
        } catch (error) {
            console.error('Error fetching public posts:', error);
            throw error;
        }
    }, []);

    const {
        data: posts,
        pagination,
        error: postsError,
        fetchData: loadPosts,
        handlePageChange
    } = usePagination(token ? fetchPostsAuth : fetchPostsPublic);

const fetchData = useCallback(async (enteredToken) => {
    if (enteredToken === token) return;
    try {
        await loadPosts(1);
        if (enteredToken) {
            const usersResponse = await fetch('/users', {
                headers: {
                    Authorization: `Bearer ${enteredToken}`,
                },
            });
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            } else {
                if (usersResponse.status === 401) {
                    sessionStorage.removeItem('token');
                    navigate('/login');
                }
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}, [loadPosts, navigate, token]);
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
        } else {
            loadPosts(1);
        }
    }, [fetchData, loadPosts]);

    const handleCreatePost = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
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
                setShowCreatePostForm(false);
                setNewPostContent('');
                setCreatePostButtonVisibility(true);
                loadPosts(1);
            } else {
                console.error('Failed to create post:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };


    return (
        <div className="container">
            {token && <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>}
            <div className="page-content">
                {token && (
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
                )}
                <div className="posts-container" style={{width: "100%"}}>
                    <div className="posts-header">
                        <h1>Posts</h1>
                        {token ? (
                            <Button
                                onClick={() => {
                                    setShowCreatePostForm(true);
                                    setCreatePostButtonVisibility(false);
                                }}
                                className={`post-button ${isCreatePostButtonVisible ? '' : 'hidden'}`}
                            >
                                Create A New Post
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="post-button"
                            >
                                Login
                            </Button>
                        )}
                    </div>
                    {showCreatePostForm && (
                        <div className="create-post-form">
              <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Enter your post content here..."
                  className="create-post-textarea"
              />
                            <Button onClick={handleCreatePost} className="post-button">
                                Post
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowCreatePostForm(false);
                                    setCreatePostButtonVisibility(true);
                                }}
                                className="post-button"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                    {postsError && <div className="error-message">{postsError}</div>}
                    <Posts posts={posts} pagination={pagination} onPageChange={handlePageChange}/>
                </div>
            </div>
        </div>
    );
};

export default App;