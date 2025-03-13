import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { jwtDecode } from "jwt-decode";
import '../styles/CommunityPage.css';
import { Heart, MessageCircle } from "lucide-react"

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch posts from backend
  useEffect(() => {
    setLoading(true);
    axios.get('/posts')
      .then(response => setPosts(response.data))
      .catch(err => {
        console.error('Error fetching posts:', err);
        setError(`Error fetching posts: ${err.message || 'Unknown error'}`);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getLoggedInUserId = () => {
   try {
     const token = localStorage.getItem('authToken');
     const decodedToken = jwtDecode(token);
     return decodedToken?.userId;
   } catch (error) {
     console.error('Invalid token:', error);
     return null;
   }
  };

  const handleCommentToggle = async (postId) => {
    // Toggle the showComments state for the selected post
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  
    // Check if comments have already been loaded
    const selectedPost = posts.find((post) => post._id === postId);

    if(!selectedPost) return;
    if (!selectedPost.commentsLoaded && !selectedPost.showComments) {
      try {
        const response = await axios.get(`/comments/${postId}`);
        if (response.status === 200) {
          const comments = response.data;
  
          // Update the comments and mark as loaded
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId
                ? { ...post, comments, commentsLoaded: true }
                : post
            )
          );
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments. Please try again.');
      }
    }
  };  

  const handleAddComment = async (postId, event) => {
    const inputElement = event.target.previousElementSibling; 
    if(!inputElement) return;

    const newCommentContent = inputElement.value.trim();
    if (!newCommentContent) return;

    try {
      const currentUserId = getLoggedInUserId();
      if (!currentUserId) {
        setError("User not logged in. Please log in to add a comment.");
        return;
      }
      const response = await axios.post(`/posts/${postId}/comments`, {
        content: newCommentContent,
        userId: currentUserId,
      });

      // Reset the input field after submission
      inputElement.value = '';
      setError('');
      const updatedPost = response.data; 
      
      console.log(`post after comment`,updatedPost);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: updatedPost.comments } : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const currentUserId = getLoggedInUserId(); 
      if (!currentUserId) {
        setError("User not logged in. Please log in to like posts.");
        return;
      }
      const response = await axios.post(`/posts/${postId}/like`,
        { userId: currentUserId }, 
        { headers: { 'Content-Type': 'application/json' } }
      );
      const updatedPost = response.data; 
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post. Please try again.');
    }
  };


  return (
    <div className="community">
      <h1>Community Engagement</h1>
      {loading && <p>Loading posts...</p>}
      {error && <p>{error}</p>}
      <section className="social-feed">
        <h2>Latest Posts</h2>
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <span className="post-user">{post.userId.username}</span>
              </div>
              <img src={post.imageUrl} alt="Post" className="post-image" />
              <p className="post-content">{post.content}</p>
              <div className="post-interactions">
                <button className="like-button" onClick={() => handleLike(post._id)}>
                  <span className="star-icon">&#9734;</span> 
                  {post.likes} Likes
                </button>
                <button
                  onClick={() => handleCommentToggle(post._id)}
                  className="comments-toggle">
                  {post.showComments ? "Hide Comments" : "View Comments"}
                </button>
              </div>
              {post.showComments && (
                <div className="comments-section">
                  <h3>Comments</h3>
                  <div className="comments-list">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment._id} className="comment">
                          <p>
                            <strong>{comment.userId ? comment.userId.username : 'Unknown User'}</strong>: {comment.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )}
                  </div>
                  <div className="comment-input-section">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="comment-input"
                    />
                    <button
                      onClick={(e) => handleAddComment(post._id, e)}
                      className="comment-button"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </section>
    </div>
  );
};

export default CommunityPage;
