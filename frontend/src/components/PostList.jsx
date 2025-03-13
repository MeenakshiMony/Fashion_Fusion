import React from "react";
import { Heart, MessageCircle } from "lucide-react";

const PostList = ({ posts }) => {
    return (
        <div className="post-list">
            {posts.map((post) => (
                <div key={post.id} className="post-card">
                    <div className="profile-header">
                        {/* Avatar */}
                        <div className="profile-avatar">U</div>
                        <h2>{post.userId.username}</h2>
                    </div>
                    <div className="post-content">
                        <p>{post.content}</p>
                        {post.imageUrl && (
                            <img src={post.imageUrl} alt="Post Image" className="post-image" />
                        )}
                    </div>
                    <div className="post-interactions">
                        <button className="like-button">
                            <Heart className="like-icon" />
                            {post.likes} Likes
                        </button>
                        <button className="comments-toggle">
                            <MessageCircle className="message-icon" />
                            {post.comments} Comments
                        </button>
                    </div>
                    <h2>{post.title}</h2>
                    <p>{post.description}</p>
                </div>
            ))}
        </div>
    );
};

export default PostList;