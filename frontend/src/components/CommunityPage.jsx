import React, { useState, useEffect } from 'react';
import '../styles/CommunityPage.css';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);  // Initialize posts as an empty array
  const [newComments, setNewComments] = useState({});  // Map for new comments per post
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Sample data for fallback in case API call fails
  const samplePosts = [
    {
      id: 1,
      user: 'User1',
      content: 'Just got this new outfit! What do you think?',
      imageUrl: "https://images.pexels.com/photos/1620782/pexels-photo-1620782.jpeg?auto=compress&cs=tinysrgb&w=600",
      likes: 10,
      comments: [
        { id: 1, text: 'Nice outfit!' },
        { id: 2, text: 'Looks amazing!' }
      ]
    },
    {
      id: 2,
      user: 'User2',
      content: 'Love this dress for the summer season!',
      imageUrl: 'https://images.pexels.com/photos/2907034/pexels-photo-2907034.jpeg?auto=compress&cs=tinysrgb&w=600',
      likes: 18,
      comments: [
        { id: 1, text: 'Perfect for summer!' }
      ]
    },
  ];

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/posts');  // Corrected API endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPosts(data);  // Set the posts data from the API response
      } catch (error) {
        setError(`Error fetching posts: ${error.message || 'Unknown error'}`);
        setPosts(samplePosts);  // Use sample data in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);  // Empty array means this runs once when the component mounts

  const handleCommentChange = (e, postId) => {
    setNewComments({ ...newComments, [postId]: e.target.value }); // Dynamically update the comment for each post
  };

  const handleCommentToggle = async (postId) => {
    const updatedPosts = posts.map((p) =>
      p.id === postId ? { ...p, showComments: !p.showComments } : p
    );
  
    setPosts(updatedPosts);
  
    const post = posts.find((p) => p.id === postId);
    if (!post.commentsLoaded && !post.showComments) {
      try {
        const response = await fetch(`http://localhost:8080/comments/${postId}`);
        if (!response.ok) throw new Error('Failed to load comments');
        const comments = await response.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments, commentsLoaded: true }
              : p
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId) => {
    const newComment = newComments[postId];
    if (!newComment) return;
  
    try {
      const response = await fetch(`http://localhost:8080/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, user: 'Current User' }), // Replace 'Current User' dynamically
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
  
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
      setNewComments({ ...newComments, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="community">
      <h1>Community Engagement</h1>
      {loading && <p>Loading posts...</p>}
      {error && <p>{error}</p>}
      <section className="social-feed">
        <h2>Latest Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <span className="post-user">{post.user}</span>
              </div>
              <img src={post.imageUrl} alt="Post" className="post-image" />
              <p className="post-content">{post.content}</p>
              <div className="post-interactions">
                <span className="likes">{post.likes} Likes</span>
                <button
                  onClick={() => handleCommentToggle(post.id)}
                  className="comments-toggle">
                  {post.showComments ? "Hide Comments" : "View Comments"}
                </button>
              </div>
              {post.showComments && (
                <div className="comments-section">
                  <h3>Comments</h3>
                  <div className="comments-list">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="comment">
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-section">
                    <input
                      type="text"
                      value={newComments[post.id] || ''}
                      onChange={(e) => handleCommentChange(e, post.id)}
                      placeholder="Add a comment..."
                      className="comment-input"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="comment-button"
                    >
                      Post
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
