import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is imported for API calls
import { useNavigate } from "react-router-dom"; // For navigation
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [savedOutfits, setSavedOutfits] = useState([
    {
      id: 1,
      imageUrl:
        "https://images.pexels.com/photos/3869692/pexels-photo-3869692.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Summer Outfit",
    },
    {
      id: 2,
      imageUrl:
        "https://images.pexels.com/photos/1868735/pexels-photo-1868735.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Winter Jacket",
    },
  ]);

  const navigate = useNavigate(); // React Router's navigation hook

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        navigate("/login"); // Redirect to login page if no token
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:8080/users/${userId}`
        );

        const user = response.data.user;

        setProfile({
          name: user.username,
          email: user.email,
          avatar: user.avatar,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to fetch profile data");
        setLoading(false);
        navigate("/login"); // Redirect to login if API call fails
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="profile-card">
          <div className="profile-image">
            <img
              src={profile.avatar || 'https://via.placeholder.com/100'} 
              alt={`${profile.name}'s avatar`}
              className="profile-avatar"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
          </div>
          <div className="profile-details">
            <p>
              <strong>Name: </strong>
              {profile.name}
            </p>
            <p>
              <strong>Email: </strong>
              {profile.email}
            </p>
          </div>
        </div>
      )}
      <section className="saved-outfits">
        <h2>Saved Outfits</h2>
        <div className="outfit-grid">
          {savedOutfits.map((outfit) => (
            <div key={outfit.id} className="outfit-card">
              <img src={outfit.imageUrl} alt={outfit.description} />
              <p>{outfit.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
