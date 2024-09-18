import React, { useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <form>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Preferences:
          <textarea
            name="preferences"
            value={profile.preferences}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfilePage;
