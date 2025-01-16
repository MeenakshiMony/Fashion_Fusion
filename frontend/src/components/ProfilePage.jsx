import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is imported for API calls
import { useNavigate } from "react-router-dom"; // For navigation
import {jwtDecode} from "jwt-decode"; // Import jwtDecode correctly
import "../styles/ProfilePage.css";
import AddPost from "./AddPost";
import SearchUsers from "./SearchUsers"; 

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPost, setShowAddPost] = useState(false);

  const [savedOutfits] = useState([
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
      const token = localStorage.getItem("authToken");

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
          id:userId,
          name: user.username,
          email: user.email,
          avatar: user.avatar,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          posts:user.posts,
          password: user.password,

        });
        
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError("Unauthorized. Please log in.");
          navigate("/login");
        } else {
          setError("Failed to fetch profile data.");
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="profile-page">
    <h1>Profile</h1>

    <div className="profile-container">
      {/* Left side: Followers and Following */}
      <div className="followers-following">
        <h3>Followers</h3>
        <p>{profile.followersCount || 0}</p>
        <h3>Following</h3>
        <p>{profile.followingCount || 0}</p>
      </div>

      {/* Central Profile Card */}
      <div className="profile-card">
        <div className="profile-image">
          <img
            src={profile.avatar || "https://via.placeholder.com/100"}
            alt={`${profile.name}'s avatar`}
            className="profile-avatar"
          />
        </div>
        <div className="profile-details">
          <p>
            <strong>Name: </strong>
            <span>{profile.name}</span>
          </p>
          <p>
            <strong>Email: </strong>
            <span>{profile.email}</span>
          </p>
        </div>
        <div className="profile-actions">
          <button className="add-post-button" onClick={() => setShowAddPost(true)} >Add Post</button>
          {/* Add Post Modal */}
          {showAddPost && (
          <AddPost
            userId={profile.id}
            onClose={() => setShowAddPost(false)}
          />
          )}
          <button className="search-users-btn">Search Users</button>
        </div>
      </div>

      {/* Right side: User's Posts */}
      <div className="user-posts">
        <h3>Your Posts</h3>
        {profile.posts?.length > 0 ? (
          profile.posts.map((post, index) => (
            <div key={index} className="post-card">
              <p>{post._id}</p>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>

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
