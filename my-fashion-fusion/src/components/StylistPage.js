import React, { useState } from 'react';
import '../styles/StylistPage.css';

const StylistPage = () => {
  const [preferences, setPreferences] = useState('');

  const handleInputChange = (event) => {
    setPreferences(event.target.value);
  };

  return (
    <div className="stylist-page">
      <h1>Virtual Stylist</h1>
      <p>Fill out your preferences to get personalized recommendations!</p>
      <textarea
        value={preferences}
        onChange={handleInputChange}
        placeholder="Enter your fashion preferences..."
      />
      <button>Get Recommendations</button>
      {/* Display recommended outfits here */}
    </div>
  );
};

export default StylistPage;
