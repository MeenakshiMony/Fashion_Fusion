import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/ProfileViewer.css';

const ProfileViewer = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/${userId}`);
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.avatar || "/placeholder.svg"} 
          alt="Profile" 
          className="profile-avatar" 
        />
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p className="email">{user.email}</p>
          {user.profile?.bio && <p className="bio">{user.profile.bio}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <span>{user.posts?.length || 0} posts</span>
        <span>{user.followersCount || 0} followers</span>
        <span>{user.followingCount || 0} following</span>
      </div>

      <div className="user-posts">
        <h3>Posts</h3>
        {user.posts && user.posts.length > 0 ? (
          <div className="posts-grid">
            {user.posts.map(post => (
              <div key={post._id} className="post-item">
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt={post.content || 'Post'} 
                    className="post-image"
                  />
                )}
                <p className="post-content">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No posts yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileViewer;