// src/components/Posts.js
import React from 'react';
import Post from "./Post";
import Button from "../components/Button";

const Posts = ({posts, pagination, onPageChange}) => {
    console.log("Posts data:", posts);
    console.log("Pagination data:", pagination);

    return (
        <>
            {!posts || posts.length === 0 ? (
                <p>Loading posts...</p>
            ) : (
                <>
                    {posts.map((post) => (
                        <Post key={post.id} post={post}/>
                    ))}

                    {pagination && (
                        <div className="pagination">
                            <Button
                                onClick={() => {
                                    if (pagination.page > 1) {
                                        onPageChange(pagination.page - 1);
                                        window.scrollTo({top: 0, behavior: 'smooth'});
                                    }
                                }}
                                disabled={pagination.page === 1 || !pagination.has_prev}
                                className={`post-button ${pagination.page === 1 || !pagination.has_prev ? 'disabled' : ''}`}>
                                Previous
                            </Button>

                            <span>
                                Page {pagination.page} of {pagination.pages || 1}
                            </span>

                            <Button
                                onClick={() => {
                                    if (pagination.page < pagination.pages) {
                                        onPageChange(pagination.page + 1);
                                        window.scrollTo({top: 0, behavior: 'smooth'});
                                    }
                                }}
                                disabled={pagination.page === pagination.pages || !pagination.has_next}
                                className={`post-button ${pagination.page === pagination.pages || !pagination.has_next ? 'disabled' : ''}`}>

                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Posts;
