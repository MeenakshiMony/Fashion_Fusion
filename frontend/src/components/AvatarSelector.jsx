// AvatarSelector.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const avatarFilenames = [
    'avatar_1.png',
    'avatar_2.png',
    'avatar_3.png',
    'avatar_4.png',
    'avatar_5.png',
    'avatar_6.png'
  ];

const AvatarSelector = ({ userId, currentAvatar, onSelect }) => {
  const [error, setError] = useState('');
  
  const handleAvatarSelect = async (filename) => {
    try {
      const avatarUrl = `http://localhost:8080/avatars/${filename}`;
      
      const response = await axios.patch(
        `http://localhost:8080/${userId}/avatar`,
        { avatar: avatarUrl }
      );

      // Verify the response contains the updated user
      if (response.data && response.data.user) {
        onSelect(response.data.user.avatar); // Use the URL from server response
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      setError('Failed to update avatar');
      console.error('Update error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="avatar-selector">
      <h3>Choose your avatar</h3>
      {error && <div className="error">{error}</div>}
      <div className="avatar-grid">
        {avatarFilenames.map((filename) => {
          const avatarUrl = `http://localhost:8080/avatars/${filename}`;
          return (
            <div 
              key={filename}
              className={`avatar-option ${currentAvatar.includes(filename) ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(filename)}
            >
              <img 
                src={avatarUrl}
                alt={`Avatar ${filename}`}
                className="avatar-thumbnail"
                onError={(e) => {
                  e.target.src = 'http://localhost:8080/avatars/default.png';
                  console.error(`Failed to load: ${avatarUrl}`);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;