import React, { useState } from "react";
import "../styles/SignupPage.css";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (Signup)
  const handleSignup = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
      return;
    }
    try {
      // Make the signup request to the backend
      const response = await axios.post("/signup", { username, email, password });

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      // Assuming a success message is returned from the backend
      setSuccess(response.data.message || "Signup successful!");
      setError("");

      // Redirect after successful signup
      setTimeout(() => navigate("/login"), 1500); // Adjust path as needed
    } catch (err) {
      // Handle error
      setError(err.response?.data?.message || "Signup failed");
      setSuccess(""); // Clear any previous success messages
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="illustration-section">
          <img
            src="" 
          //   alt="Close-up of a person's hand resting on a wooden chair, wearing a minimalist wristwatch with a brown strap and a rose-gold dial. The person is dressed in a white blouse, accessorized with a pearl necklace and gold rings, sitting outdoors."
           />
        </div>
        <div className="form-section">
          <h2>Sign up to discover Fashion Fusion!</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="username"
                placeholder="Tom"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="major.tom@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="signup-button"
              disabled={formData.password !== formData.confirmPassword}
            >
              Sign Up
            </button>
          </form>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
