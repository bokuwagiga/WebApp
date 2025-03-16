// src/components/Comments.js
import React from 'react';
import { Link } from 'react-router-dom';

const Comments = ({ comments }) => {
    console.log("Comments data:", comments); // Debugging line

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
        return <p>No comments yet.</p>;
    }

    return (
        <div className="comments-section">
            <h2 className="comments-heading">Comments</h2>
            <ul className="comments-list">
                {comments.map((comment) => (
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
        </div>
    );
};

export default Comments;
