import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DisplayPosts from './DisplayPosts';
import '../styles/ProfileViewer.css';

const ProfileViewer = ({ currentUserId }) => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, followStatusRes] = await Promise.all([
          axios.get(`http://localhost:8080/users/profile/${userId}`),
          currentUserId && axios.post(`http://localhost:8080/users/check-follow`, {
            currentUserId,
            targetUserId: userId
          })
        ]);

        setProfile(profileRes.data.profile);
        setIsFollowing(followStatusRes?.data?.isFollowing || false);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/users/follow/${userId}`, {
        currentUserId
      });
      
      setIsFollowing(response.data.isFollowing);
      setProfile(prev => ({
        ...prev,
        followersCount: response.data.followersCount
      }));
    } catch (err) {
      setError('Failed to update follow status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-viewer">
      <div className="profile-header">
        <img src={profile.avatar} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <div className="profile-stats">
            <span>{profile.posts.length} posts</span>
            <span>{profile.followersCount} followers</span>
            <span>{profile.followingCount} following</span>
          </div>
        </div>
        {currentUserId !== userId && (
          <button 
            onClick={handleFollowToggle}
            className={`follow-button ${isFollowing ? 'unfollow' : 'follow'}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <DisplayPosts 
        posts={profile.posts} 
        avatar={profile.avatar}
        username={profile.username}
        isCurrentUser={currentUserId === userId}
      />
    </div>
  );
};

export default ProfileViewer;