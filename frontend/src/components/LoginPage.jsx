import React, { useState } from "react";
import '../styles/LoginPage.css';
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";


const LoginSignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { email, password });
      // Store the JWT token in localStorage or sessionStorage
      localStorage.setItem("token", response.data.token);
      // Redirect user to their profile or home page
      navigate('/home'); // or any route
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  
  return (
    <div className="login-signup-page">
      {/* <h1>{isLogin ? 'Login' : 'Signup'}</h1> */}
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              value={email}
              onChange={ (e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            value={password}
            onChange={ (e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              
          /> 
        </div>    
        <button type="submit">Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      </form>
    </div>
  );
};

export default LoginSignupPage;