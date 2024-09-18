import React from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <section className="hero">
        <h1>Welcome to Fashion Fusion</h1>
        <p>Your AI-powered virtual fashion assistant</p>
        <button>Get Started</button>
      </section>
      <section className="features">
        <div className="feature-item">
          <h2>Virtual Stylist</h2>
          <p>Get personalized outfit recommendations tailored to you.</p>
        </div>
        <div className="feature-item">
          <h2>Virtual Try-On</h2>
          <p>Visualize how clothes fit on your 3D avatar or image.</p>
        </div>
        <div className="feature-item">
          <h2>Community Engagement</h2>
          <p>Share your outfits and engage with fashion enthusiasts.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
