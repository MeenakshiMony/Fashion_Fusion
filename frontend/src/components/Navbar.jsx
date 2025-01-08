import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Fashion Fusion</Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
        <li><Link to="/stylist" onClick={toggleMenu}>Virtual Stylist</Link></li>
        <li><Link to="/tryon" onClick={toggleMenu}>Virtual Try-On</Link></li>
        <li><Link to="/community" onClick={toggleMenu}>Community</Link></li>
        <li><Link to="/profile" onClick={toggleMenu}>Profile</Link></li>
        <li><Link to="/login" onClick={toggleMenu}>Login</Link></li>
        <li><Link to="/Signup" onClick={toggleMenu}>Sign Up</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
