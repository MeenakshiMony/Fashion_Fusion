import React, { useState } from 'react';
import '../styles/SignupPage.css';
import axios from "../utils/axios";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("/auth/register", {
        username,
        email,
        password,
      });

      console.log(response.data); //can be deleted later if not needed

      setSuccess("Registration successful! Please login.");
      setError(""); // Clear any previous error
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setSuccess(""); // Clear any previous success message
    }
  };

  return (
    <div className="signup-page">
    <h1>Sign Up</h1> 
      <form onSubmit={handleSignup} className="signup-form">
        <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
        </div> 
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter the password again"
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
    </div>
  );
};

export default SignupPage;
