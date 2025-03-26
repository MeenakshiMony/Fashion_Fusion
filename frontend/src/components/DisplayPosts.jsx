import React, { useEffect, useState } from "react";
import "../styles/DisplayPosts.css";
import { Heart } from "lucide-react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB limit

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
            imageUrl={post.imageUrl}
            likes={post.likes}
            comments={post.comments}
          />
        ))
      )}
    </div>
  );
};

export default DisplayPosts;
