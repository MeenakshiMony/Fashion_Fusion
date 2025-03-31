import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/ProfilePage.css";
import { Users, Image, Search } from "lucide-react"


import AddPost from "./AddPost";
import SearchUsers from "./SearchUsers";
import DisplayPosts from "./DisplayPosts";


const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    followersCount: 0,
    followingCount: 0,
    posts: [],
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts"); // State to track active tab

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

      console.log(response.data.user);
      setProfile({
        id: userId,
        name: user.username,
        email: user.email,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        posts: user.posts,
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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [profile.id]);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`http://localhost:8080/posts/${profile.id}`);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      {/* Profile Card */}
      <div className="profile-card">
        {/* Header with Gradient */}
        <div className="profile-header"></div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="profile-image">
            <img
              src={profile.avatar || "https://www.freepik.com/icon/user-avatar_5561278"}
              alt={`${profile.name}'s avatar`}
              className="profile-avatar"
            />
          </div>
          <p>
            <strong>Name: </strong>
            <span>{profile.name}</span>
          </p>
          <p>
            <strong>Email: </strong>
            <span>{profile.email}</span>
          </p>
          <p>
            <strong>Followers: </strong>
            <span>{profile.followersCount || 0}</span>
            <strong> Following: </strong>
            <span>{profile.followingCount || 0}</span>
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <Image  />
            Posts
        </button>
        <button
          className={`tab-button ${activeTab === "addPost" ? "active" : ""}`}
          onClick={() => setActiveTab("addPost")}
        >
          <Image />
          Add Post
        </button>
        <button
          className={`tab-button ${activeTab === "searchUsers" ? "active" : ""}`}
          onClick={() => setActiveTab("searchUsers")}
        >
          <Search />
          Search Users
        </button>
        <button
          className={`tab-button ${activeTab === "savedOutfits" ? "active" : ""}`}
          onClick={() => setActiveTab("savedOutfits")}
        >
          <Image />
          saved Outfits
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "posts" && (
          <DisplayPosts posts={profile.posts } avatar={profile.avatar} username={profile.name}/>
        )}

        {activeTab === "addPost" && (
          <div className="add-post-section">
            <AddPost
              userId={profile.id}
              onClose={() => { setShowAddPost(false); fetchPosts(); }} 
            />
          </div>
        )}


        {activeTab === "searchUsers" && (
          <div className="search-users-section">
            <SearchUsers currentUserId={profile.id} refreshProfile={fetchProfile}/>
          </div>
        )}

        {activeTab === "savedOutfits" && (
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
        )}
      </div>
      
    </div>
  );
};

export default ProfilePage;