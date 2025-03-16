// src/components/Post.js
import React from 'react';
import {Link} from 'react-router-dom';
import Comments from "./Comments";


const Post = ({post}) => {
    console.log("Post data:", post);

    return (
        <div key={post.post_id} className="post">
            <div className="post-header">
                Author:
                <Link to={`/users/${post.user_id}`} className="user-link">
                    {post.user}
                </Link>
            </div>
            <div className="post-content">{post.post_content}</div>
            <Comments comments={post.comments}/>
            <Link to={`/posts/${post.post_id}`} className="view-post-button">
                View Post
            </Link>
        </div>
    );
};

export default Post;
