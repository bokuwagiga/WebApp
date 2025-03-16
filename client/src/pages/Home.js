import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import Button from '../components/Button';
import Posts from "../components/Posts";

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
            <header className="header" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h1 className="header-text">Home</h1>
                <Link to="/login" className="button">
                    <Button>Login</Button>
                </Link>
            </header>
            <div className="page-content">
                <div className="posts-container" style={{width: "100%"}}>
                    <Posts posts={posts}></Posts>
                </div>
            </div>
        </div>
    );

};

export default Home;
