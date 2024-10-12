import React, { useState } from 'react';
import '../styles/CommunityPage.css';

// Sample data for posts
const samplePosts = [
  {
    id: 1,
    user: 'User1',
    content: 'Just got this new outfit! What do you think?',
    imageUrl: "https://images.pexels.com/photos/1620782/pexels-photo-1620782.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: 2,
    user: 'User2',
    content: 'Love this dress for the summer season!',
    imageUrl: 'https://images.pexels.com/photos/2907034/pexels-photo-2907034.jpeg?auto=compress&cs=tinysrgb&w=600',
    likes: 18,
    comments: 5
  }
];


const CommunityPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [posts, setPosts] = useState(samplePosts);
  const [newComment, setNewComment] = useState('');

  const handleCommentChange = (e) => setNewComment(e.target.value);

  const handleAddComment = (postId) => {
    // Logic to add a comment to the post
    console.log(`Add comment: ${newComment} to post ${postId}`);
    setNewComment('');
  };

  return (
    <div className="community">
      <h1>Community Engagement</h1>
      <section className="social-feed">
        <h2>Latest Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <span className="post-user">{post.user}</span>
            </div>
            <img src={post.imageUrl} alt="Post" className="post-image" />
            <p className="post-content">{post.content}</p>
            <div className="post-interactions">
              <span className="likes">{post.likes} Likes</span>
              <span className="comments">{post.comments} Comments</span>
            </div>
            <div className="comment-section">
              <input
                type="text"
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button onClick={() => handleAddComment(post.id)} className="comment-button">
                Post
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CommunityPage;
