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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="illustration-section">
          <img
            src="https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt ="Fashion Fusion Signup Illustration"
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
                placeholder="Enter your full name"
                value={formData.username}
                onChange={handleChange}
                required
                aria-label="Username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
                aria-label="Email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                aria-label="Password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                aria-label="Confirm Password"
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
            <button
              type="submit"
              className="signup-button"
              disabled={formData.password !== formData.confirmPassword || loading}
            >
              {loading ? "Signup in progress..." : "Sign Up"}
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
