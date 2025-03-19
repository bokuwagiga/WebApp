// src/components/Comments.js
import React from 'react';
import {Link} from 'react-router-dom';

const Comments = ({comments}) => {
    console.log("Comments data:", comments);

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
        return <p className="info-text">No comments to show.</p>;
    }

    return (
        <div className="comments-section">
            <h2 className="comments-heading">Comments</h2>
            <ul className="comments-list">
                {comments.map((comment) => (
                    <div key={comment.comment_id} className="comment-item">
                        <div className="header-info">
                            {new Date(comment.last_updated + 'Z').toLocaleString(undefined, {hour12: false})}

                            <Link to={`/users/${comment.user_id}`} className="user-link">
                                #{comment.user}:
                            </Link>
                        </div>
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
