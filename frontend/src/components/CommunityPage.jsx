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

  const handleAddComment = async (postId) => {
    if (newComments[postId]?.trim()) {
      try {
        const response = await fetch(`http://localhost:8080/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newComments[postId] }), // Send the new comment to the backend
        });
  
        if (!response.ok) {
          throw new Error('Failed to add comment');
        }
  
        const updatedPost = await response.json(); // Get the updated post from the server
        const updatedPosts = posts.map((post) =>
          post.id === postId ? updatedPost : post
        );
        setPosts(updatedPosts);
        setNewComments({ ...newComments, [postId]: '' }); // Reset the comment input
      } catch (error) {
        setError('Error adding comment');
      }
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
                <span className="likes">{post.likes} Likes </span>
                <span className="comments">{post.comments.length} Comments</span>
              </div>
              <div key={post.id} className="comment-section">
                <input
                  type="text"
                  value={newComments[post.id] || ''}
                  onChange={(e) => handleCommentChange(e, post.id)}
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button onClick={() => handleAddComment(post.id)} className="comment-button">
                  Post
                </button>
                <div className="comments-list">
                  {post.comments.map((comment) => (
                    <div key={`${post.id}-${comment.id}`} className="comment">   {/* Combine post.id and comment.id */}
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
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
