import React, { useEffect, useState } from "react";
import "../styles/DisplayPosts.css";
import { Heart, Trash2 } from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

const Post = ({ username, avatar, content, imageId, likes, comments,postId, onDeletePost, isCurrentUser }) => {
  // Construct the image URL using the imageId
  const imageUrl = imageId ? `http://localhost:8080/image/${imageId}` : null;

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <img src={avatar} alt="User avatar" className="post-avatar" />
        <span className="post-username">{username}</span>
        {isCurrentUser && (
          <button 
            onClick={() => onDeletePost(postId)}
            className="delete-post-button"
            aria-label="Delete post"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        {imageUrl && <img src={imageUrl} alt="Post" className="post-image" onError={(e) => {e.target.style.display = 'none'}}/>}
        <p className="post-text-content">{content}</p>
      </div>

      {/* Post Interactions */}
      <div className="post-interactions">
        <div className="post-likes-container">
          <Heart />
          <span className="post-likes">{likes} Likes</span>
        </div>
        {comments && comments.length > 0 && (
          <span className="post-comments"> {comments.length} Comments</span>
        )}
      </div>
    </div>
  );
};

const DisplayPosts = ({ posts, avatar, username, onDeletePost, isCurrentUser }) => {

  return (
    <div className="display-posts">
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to share something!</p>
      ) : (
        posts.map((post) => (
          <Post
            key={post._id} // Ensure unique key
            postId={post._id}
            username={username}
            avatar={avatar}
            content={post.content}
            imageId={post.imageId}
            likes={post.likes}
            comments={post.comments}
            onDeletePost={onDeletePost}
            isCurrentUser={isCurrentUser}
          />
        ))
      )}
    </div>
  );
};

export default DisplayPosts;
