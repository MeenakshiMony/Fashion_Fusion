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
import Logout from './components/Logout';
import './styles/App.css';

const PrivateRoute = ({children}) => {
  const token = localStorage.getItem("token"); 
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes future={{ v7_startTransition: true }}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stylist" element={<StylistPage />} />
          <Route path="/tryon" element={<TryOnPage />} />
          <Route path="/community" element={<CommunityPage />} />

          {/* Use PrivateRoute for protected routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/logout" element={<Logout />} />
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

