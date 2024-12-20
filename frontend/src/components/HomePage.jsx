import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Fashion Fusion</h1>
          <p>Your AI-powered virtual fashion assistant</p>
          <Link to="/stylist">
            <button className="cta-button">Get Started</button>
          </Link>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" alt="Fashion" />
        </div>
      </section>

      <section className="features">
        <div className="feature-item">
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9" alt="Virtual Stylist" />
          <h2>Virtual Stylist</h2>
          <p>Get personalized outfit recommendations tailored to you.</p>
          <Link to="/stylist">
            <button className="feature-button">Explore Stylist</button>
          </Link>
        </div>

        <div className="feature-item">
          <img src="https://images.pexels.com/photos/4145251/pexels-photo-4145251.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Virtual Try-On" />
          <h2>Virtual Try-On</h2>
          <p>Visualize how clothes fit on your 3D avatar or image.</p>
          <Link to="/tryon">
            <button className="feature-button">Try it On</button>
          </Link>
        </div>

        <div className="feature-item">
          <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce" alt="Community" />
          <h2>Community Engagement</h2>
          <p>Share your outfits and engage with fashion enthusiasts.</p>
          <Link to="/community">
            <button className="feature-button">Join the Community</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

