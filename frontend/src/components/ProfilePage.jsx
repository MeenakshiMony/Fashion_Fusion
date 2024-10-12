import React, { useState } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: '',
  });

  // eslint-disable-next-line no-unused-vars
  const [savedOutfits, setSavedOutfits] = useState([
    {
      id: 1,
      imageUrl: 'https://images.pexels.com/photos/3869692/pexels-photo-3869692.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Summer Outfit'
    },
    {
      id: 2,
      imageUrl: 'https://images.pexels.com/photos/1868735/pexels-photo-1868735.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Winter Jacket'
    }
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <form className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="preferences">Preferences:</label>
          <textarea
            id="preferences"
            name="preferences"
            value={profile.preferences}
            onChange={handleInputChange}
            placeholder="Enter your fashion preferences..."
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
      <section className="saved-outfits">
        <h2>Saved Outfits</h2>
        <div className="outfit-grid">
          {savedOutfits.map((outfit) => (
            <div key={outfit.id} className="outfit-card">
              <img src={outfit.imageUrl} alt={outfit.description} />
              <p>{outfit.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
