import { useState } from 'react';
import '../styles/StylistPage.css';

const StylistPage = () => {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleInputChange = (event) => {
    setPreferences(event.target.value);
  };

  const handleGetRecommendations = async () => {
  try {
    // Mock delay to simulate an API call
    setRecommendations([]);
    setTimeout(() => {
      setRecommendations([
        {
          id: 1,
          imageUrl: 'https://images.pexels.com/photos/1072036/pexels-photo-1072036.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Casual Blue Jacket'
        },
        {
          id: 2,
          imageUrl: "https://images.pexels.com/photos/1649676/pexels-photo-1649676.jpeg?auto=compress&cs=tinysrgb&w=600",
          description: 'Summer Floral Dress'
        }
      ]);
    }, 1000);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }
};


  return (
    <div className="stylist-page">
      <header className="page-header">
        <h1>Virtual Stylist</h1>
        <p>Fill out your preferences to get personalized recommendations!</p>
      </header>
      <section className="preferences-form">
        <textarea
          value={preferences}
          onChange={handleInputChange}
          placeholder="Enter your fashion preferences..."
          rows="6"
        />
        <button onClick={handleGetRecommendations}>Get Recommendations</button>
      </section>
      <section className="recommendations">
        {recommendations.length > 0 && (
          <>
            <h2>Recommended Outfits</h2>
            <div className="recommendation-grid">
              {recommendations.map((rec) => (
                <div key={rec.id} className="recommendation-card">
                  <img src={rec.imageUrl} alt={rec.description} />
                  <p>{rec.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default StylistPage;
