import React, { useState } from "react";
import "../styles/LoginPage.css";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  // Handle form submission (Login)
  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    try {
      // Make the login request to the backend
      const response = await axios.post("/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      // Assuming a success message is returned from the backend
      setSuccess(response.data.message || "Login successful!");
      setError("");

      // Redirect after successful login
      setTimeout(() => navigate('/profile'), 1000); // Adjust path as needed
    } catch (err) {
      // Handle error
      setError(err.response?.data?.message || "Login failed");
      setSuccess(""); // Clear any previous success messages
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="form-section">
          <h2>Welcome back to Fashion Fusion!</h2>
          <form onSubmit={handleLogin}>
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
            <button
              type="submit"
              className="login-button"
            >
              Log In
            </button>
          </form>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="illustration-section">
          <img
            src="../assets/Fashion_Fusion_Login.jpg"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
