import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import StylistPage from './components/StylistPage';
import TryOnPage from './components/TryOnPage';
import CommunityPage from './components/CommunityPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import './styles/App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes future={{ v7_relativeSplatPath: true }}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stylist" element={<StylistPage />} />
          <Route path="/tryon" element={<TryOnPage />} />
          <Route path="/community" element={<CommunityPage />} />
          
          {/* Protected Profile Route */}
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Redirect to Home if route not found */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
