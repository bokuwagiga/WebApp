// src/components/Posts.js
import React from 'react';
import Post from "./Post";


const Posts = ({posts}) => {
    console.log("Posts data:", posts);
    return (
        <div>
            {posts.length === 0 ? (
                <p>Loading posts...</p>
            ) : (
                posts.map((post) => (
                <Post post={post}/>
                ))
            )}
        </div>
    );
};

export default Posts;
