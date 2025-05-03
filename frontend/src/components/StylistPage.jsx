import React, { useState } from 'react';
import axios from 'axios';
import '../styles/StylistPage.css';

const StylistPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setRecommendations([]);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/recommend', formData);

      // Filter out the input image (first item) from recommendations
      const filteredRecommendations = response.data.recommendations
      .filter((_, index) => index !== 0) // Remove first item
      .map(item => ({
        id: item.id,
        imageUrl: `http://localhost:5000${item.image_url}`,
        description: `Style ${item.id}`,
        similarity: item.similarity
      }));

      const processedData = {
        uploadedImage: `http://localhost:5000${response.data.uploaded_image_url}`,
        recommendations: filteredRecommendations
      };      

      setUploadedImage(processedData.uploadedImage);
      setRecommendations(processedData.recommendations);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data
      });
      setError("Failed to get recommendations. Please try another image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stylist-page">
      <header className="page-header">
        <h1>Outfit Recommender</h1>
        <p>Upload an outfit photo to find similar styles</p>
      </header>
  
      <div className="upload-section">
        <input 
          type="file" 
          id="fashion-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
        <label htmlFor="fashion-upload" className="upload-button">
          {isLoading ? (
            <span className="upload-loading">
              <span className="spinner"></span> Processing...
            </span>
          ) : (
            'Upload Outfit Photo'
          )}
        </label>
      </div>
  
      {uploadedImage && (
        <div className="uploaded-preview">
          <h3>Your Upload:</h3>
          <div className="uploaded-image-container">
            <img src={uploadedImage} alt="Uploaded outfit" />
          </div>
        </div>
      )}
  
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
  
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finding similar styles...</p>
        </div>
      ) : (
        recommendations.length > 0 && (
          <section className="recommendations">
            <h2>Recommended Styles</h2>
            <div className="recommendation-grid">
              {recommendations.map((item) => (
                <div key={item.id} className="recommendation-card">
                  <img 
                    src={item.imageUrl}
                    alt={`Style ${item.id}`}
                    onError={(e) => {
                      e.target.src = '/fallback-image.jpg';
                      console.error('Image load failed:', item.imageUrl);
                    }}
                  />
                  <div className="recommendation-meta">
                    <span>Style #{item.id}</span>
                    <span>{Math.round(item.similarity * 100)}% match</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
};

export default StylistPage;