// src/components/Posts.js
import React from 'react';
import Post from "./Post";
import Button from "../components/Button";

const Posts = ({posts, pagination, onPageChange}) => {
    console.log("Posts data:", posts);

    return (
        <div>
            {!posts || posts.length === 0 ? (
                <p>Loading posts...</p>
            ) : (
                <>
                    <div className="posts-list">
                        {posts.map((post) => (
                            <Post key={post.post_id} post={post}/>
                        ))}
                    </div>

                    {pagination && (
                        <div className="pagination-controls">
                            <Button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={!pagination.has_prev}
                                className="post-button"
                            >
                                Previous
                            </Button>

                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages || 1}
                            </span>

                            <Button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={!pagination.has_next}
                                className="post-button"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Posts;