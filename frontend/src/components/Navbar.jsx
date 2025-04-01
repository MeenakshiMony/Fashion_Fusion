import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import { AlignJustify } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setToken(token);
    console.log("Token: ", token);
  }, [location]); // Ensure token is checked on each navigation

  


  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Fashion Fusion</Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        <AlignJustify size={24} color="#333" />
      </button>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
        <li><Link to="/stylist" onClick={toggleMenu}>Virtual Stylist</Link></li>
        <li><Link to="/tryon" onClick={toggleMenu}>Virtual Try-On</Link></li>
        <li><Link to="/community" onClick={toggleMenu}>Community</Link></li>
        
        {/* <li><Link to="/login" onClick={toggleMenu}>Login</Link></li>
        <li><Link to="/Signup" onClick={toggleMenu}>Sign Up</Link></li> */}
        {token ? (
        <>
          <Link to="/profile" onClick={toggleMenu}>Profile</Link>
          <Link to="#" onClick={() => { toggleMenu(); handleLogout(); }}>Logout</Link>

        </>
      ) : (
        <>
          <Link to="/login" onClick={toggleMenu}>Login</Link>
          <Link to="/signup" onClick={toggleMenu}>Signup</Link>
        </>
      )}
      </ul>
    </nav>
  );
};

export default Navbar;
