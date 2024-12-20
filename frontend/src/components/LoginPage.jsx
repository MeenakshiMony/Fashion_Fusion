import React, { useState } from "react";
import '../styles/LoginPage.css';
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";


const LoginSignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // For handling success messages

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Make the login request to the backend
      const response = await axios.post("/login", { email, password });

      // Check if the response contains the token
      if (response.data.token) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", response.data.token);

        setSuccess("Login successful!");
        setError("");
        setTimeout(() => navigate('/profile'), 1000); // Redirect after 1 second
      }
    } catch (err) {
      // Handle error
      setError(err.response?.data?.message || "Login failed");
      setSuccess(""); // Clear any previous success messages
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
              required
            />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            value={password}
            onChange={ (e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
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