import React, {useState, useEffect} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Header from '../components/Header';
import '../styles/App.css';
import Button from '../components/Button';
import Comments from "../components/Comments";

const PostPage = ({token}) => {
    const {post_id} = useParams();
    const [post, setPost] = useState(null);
    const [decodedToken, setDecodedToken] = useState({});
    const [commentContent, setCommentContent] = useState('');
    const [isCommentFormVisible, setCommentFormVisibility] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [updatedContent, setUpdatedContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postResponse = await fetch(`/posts/${post_id}`);
                const commentsResponse = await fetch(`/posts/${post_id}/comments`);

                if (postResponse.ok && commentsResponse.ok) {
                    const postData = await postResponse.json();
                    const commentsData = await commentsResponse.json();

                    const postWithComments = {...postData, comments: commentsData.comments};

                    setPost(postWithComments);
                } else {
                    console.error('Error fetching post or comments:', postResponse.statusText, commentsResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching post or comments:', error);
            }
        };

        fetchPost();
    }, [post_id]);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const handleAddComment = async () => {
        try {
            const response = await fetch(`/posts/${post_id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({comment_content: commentContent}),
            });

            if (response.ok) {
                setCommentFormVisibility(false);
                window.location.reload();
            } else {
                console.error('Error adding comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setDecodedToken(decodedToken);
        }
    }, []);

    const handleUpdatePost = async () => {
        try {
            setEditing(true);
            setUpdatedContent(post.post_content);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleSaveUpdate = async () => {
        try {
            const response = await fetch(`/posts/${post_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({post_content: updatedContent}),
            });

            if (response.ok) {
                setEditing(false);
                window.location.reload();
            } else {
                console.error('Error updating post:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleCancelUpdate = () => {
        setEditing(false);
        setUpdatedContent('');
    };

    const handleDeletePost = async () => {
        try {
            const shouldDelete = window.confirm('Are you sure you want to delete this post?');

            if (shouldDelete) {
                const response = await fetch(`/posts/${post_id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    navigate('/posts');
                } else {
                    console.error('Error deleting post:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className="container">
            <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>
            <div className="post-page">
                <h1>Post</h1>
                {post ? (
                    <div className="posts-container">
                        <div className="post">
                            <div className="post-header">
                                Author:
                                <Link to={`/users/${post.user_id}`} className="user-link">
                                    {post.user}
                                </Link>
                                <div className="post-actions">
                                    {(decodedToken.user_id === post.user_id || decodedToken.is_admin) && (
                                        <>
                                            {!isEditing && (
                                                <Button onClick={handleUpdatePost} className="edit-post-button">
                                                    Edit Post
                                                </Button>
                                            )}
                                            <Button onClick={handleDeletePost} className="delete-button">
                                                Delete Post
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {isEditing ? (
                                <div className="update-post-form">
                <textarea
                    value={updatedContent}
                    onChange={(e) => setUpdatedContent(e.target.value)}
                    placeholder="Enter the updated post content..."
                />
                                    <Button onClick={handleSaveUpdate} className="post-button">
                                        Save
                                    </Button>
                                    <Button onClick={handleCancelUpdate} className="post-button">
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <div className="post-content">{post.post_content}</div>
                            )}
                            <Comments comments={post.comments}/>
                            {!isCommentFormVisible && (
                                <Button onClick={() => setCommentFormVisibility(true)} className="post-button">
                                    Add Comment
                                </Button>
                            )}
                            {isCommentFormVisible && (
                                <div className="add-comment-section">
                <textarea
                    className="create-post-textarea"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Add your comment..."
                />
                                    <Button onClick={handleAddComment} className="post-button">
                                        Comment
                                    </Button>
                                    <Button onClick={() => setCommentFormVisibility(false)} className="post-button">
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>Loading post...</p>
                )}
            </div>
        </div>
    );
};

export default PostPage;
