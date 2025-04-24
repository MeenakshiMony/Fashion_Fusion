import React, { useEffect, useState } from "react";
import "../styles/DisplayPosts.css";
import { Heart } from "lucide-react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB limit

const Post = ({ username, avatar, content, imageId, likes, comments }) => {
  // Construct the image URL using the imageId
  const imageUrl = imageId ? `http://localhost:8080/image/${imageId}` : null;

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <img src={avatar} alt="User avatar" className="post-avatar" />
        <span className="post-username">{username}</span>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {imageUrl && <img src={imageUrl} alt="Post" className="post-image" onError={(e) => {e.target.style.display = 'none'}}/>}
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

const DisplayPosts = ({ posts, avatar, username }) => {

  return (
    <div className="display-posts">
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to share something!</p>
      ) : (
        posts.map((post) => (
          <Post
            key={post._id} // Ensure unique key
            username={username}
            avatar={avatar}
            content={post.content}
            imageId={post.imageId}
            likes={post.likes}
            comments={post.comments}
          />
        ))
      )}
    </div>
  );
};

export default DisplayPosts;
