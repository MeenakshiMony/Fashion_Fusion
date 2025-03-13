import React from "react";
import '../styles/DisplayPosts.css';
import { Heart } from 'lucide-react';

const Post = ({ username, avatar, content, imageUrl, likes, comments }) => {
  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <span className="post-username">{username}</span>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {imageUrl && <img src={imageUrl} alt="Post" className="post-image" />}
        
      </div>

      {/* Post Interactions */}
      <div className="post-interactions">
        <div className="post-likes-container">
          <Heart />
          <span className="post-likes">{likes} Likes</span>
        </div>
        <p className="post-content">{content}</p>
      </div>
    </div>
  );
};

const DisplayPosts = ({ posts ,avatar, username}) => {
  return (
    <div className="display-posts">
      {posts.map((post, index) => (
        <Post
          key={index}
          username={username}
          avatar={avatar}
          content={post.content}
          imageUrl={post.imageUrl}
          likes={post.likes}
          comments={post.comments}
        />
      ))}
    </div>
  );
};

export default DisplayPosts;