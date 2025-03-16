// CommentPage.js

import React, {useState, useEffect} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Header from '../components/Header';
import '../styles/App.css';
import Button from '../components/Button';

const CommentPage = ({token}) => {
    const {comment_id} = useParams();
    const [comment, setComment] = useState(null);
    const [decodedToken, setDecodedToken] = useState({});
    const [editedContent, setEditedContent] = useState('');
    const [isEditing, setEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComment = async () => {
            try {
                const commentResponse = await fetch(`/comments/${comment_id}`);

                if (commentResponse.ok) {
                    const commentData = await commentResponse.json();
                    setComment(commentData);
                } else {
                    console.error('Error fetching comment:', commentResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching comment:', error);
            }
        };

        fetchComment();
    }, [comment_id]);

    // Decode token
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setDecodedToken(decodedToken);
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const handleEditComment = () => {
        // Set isEditing to true to render the textarea for editing
        setEditing(true);
        setEditedContent(comment.comment_content);
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`/comments/${comment_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({comment_content: editedContent}),
            });

            if (response.ok) {
                setEditing(false);
                window.location.reload();
            } else {
                console.error('Error updating comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditedContent('');
    };

    const handleDeleteComment = async () => {
        try {
            const shouldDelete = window.confirm('Are you sure you want to delete this comment?');

            if (shouldDelete) {
                const response = await fetch(`/comments/${comment_id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    navigate('/posts'); // Navigate to the desired route after comment deletion
                } else {
                    console.error('Error deleting comment:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="container">
            <Header token={token} decodedToken={decodedToken} handleLogout={handleLogout}/>
            <div className="comment-page">
                <h1>Comment</h1>
                {comment ? (
                    <div className="comments-container">
                        <div className="comment-header">
                            Author:
                            <Link to={`/users/${comment.user_id}`} className="user-link">
                                {comment.user}
                            </Link>
                            <div className="comment-actions">
                                {(decodedToken.user_id === comment.user_id || decodedToken.is_admin) && (
                                    <>
                                        {!isEditing && (
                                            <Button onClick={handleEditComment} className="post-button">
                                                Edit Comment
                                            </Button>
                                        )}
                                        <Button onClick={handleDeleteComment} className="delete-button">
                                            Delete Comment
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                            <div className="edit-comment-form">
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Enter the edited comment content..."
                />
                                <Button onClick={handleSaveEdit} className="post-button">
                                    Save
                                </Button>
                                <Button onClick={handleCancelEdit} className="post-button">
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="comment-content">{comment.comment_content}</div>
                        )}
                    </div>
                ) : (
                    <p>Loading comment...</p>
                )}
            </div>
        </div>
    );
};

export default CommentPage;
