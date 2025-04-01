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
  const [posts, setPosts] = useState([]);

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
    fetchPosts();
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [profile.id]);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
      fetchProfile();
    }
  }, [activeTab]);

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
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "posts" && (
          <DisplayPosts posts={posts } avatar={profile.avatar} username={profile.name}/>
        )}

        {activeTab === "addPost" && (
          <div className="add-post-section">
            <AddPost
              userId={profile.id}
              onClose={() => { fetchPosts(); setActiveTab("posts"); fetchProfile() }}
            />
          </div>
        )}


        {activeTab === "searchUsers" && (
          <div className="search-users-section">
            <SearchUsers currentUserId={profile.id} refreshProfile={fetchProfile}/>
          </div>
        )}

      </div>
      
    </div>
  );
};

export default ProfilePage;