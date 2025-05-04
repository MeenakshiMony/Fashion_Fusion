import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/ProfilePage.css";
import { User, Image, Search, Edit, Save, X, Lock, Trash2, Mail, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import AddPost from "./AddPost";
import SearchUsers from "./SearchUsers";
import DisplayPosts from "./DisplayPosts";
import AvatarSelector from "./AvatarSelector";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    profile: {
      firstName: "",
      lastName: "",
      bio: ""
    },
    followersCount: 0,
    followingCount: 0,
    posts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: ""
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const bioRef = useRef(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      navigate("/login");
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
        id: userId,
        name: user.username,
        email: user.email,
        avatar: user.avatar,
        profile: {
          firstName: user.profile?.firstName || "",
          lastName: user.profile?.lastName || "",
          bio: user.profile?.bio || ""
        },
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        posts: user.posts,
      });

      // Initialize edit form data
      setEditFormData({
        username: user.username,
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        bio: user.profile?.bio || ""
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
    if (profile.id) {
      fetchPosts();
    }
  }, [profile.id]);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
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

  const handleAvatarUpdate = (newAvatar) => {
    setProfile(prev => ({ ...prev, avatar: newAvatar }));
    setShowAvatarSelector(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8080/usersupdate/${profile.id}`,
        {
          username: editFormData.username,
          profile: {
            firstName: editFormData.firstName,
            lastName: editFormData.lastName,
            bio: editFormData.bio
          }
        }
      );

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          name: response.data.user.username,
          profile: {
            firstName: response.data.user.profile?.firstName || "",
            lastName: response.data.user.profile?.lastName || "",
            bio: response.data.user.profile?.bio || ""
          }
        }));
        setShowEditForm(false);
      } else {
        setError(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
  
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
  
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
  
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
  
    try {
    
      const response = await axios.put(
        `http://localhost:8080/change-password`, // Make sure this matches your backend route
        {
          userId: profile.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        },
      );
  
      if (response.data.success) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Auto-close form after 3 seconds
        setTimeout(() => {
          setShowPasswordForm(false);
        }, 3000);
      } else {
        setPasswordError(response.data.message || "Password update failed");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage = error.response?.data?.message || 
                         "Failed to update password. Please try again.";
      setPasswordError(errorMessage);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/${postId}`,
      );

      if (response.data.success) {
        // Optimistic UI update
        setPosts(posts.filter(post => post._id !== postId));
        setProfile(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post._id !== postId),
          postsCount: prev.postsCount - 1
        }));
        
        // Show success message
        alert("Post deleted successfully");
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = bioRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentValue = editFormData.bio;
    
    setEditFormData({
      ...editFormData,
      bio: currentValue.substring(0, startPos) + emoji + currentValue.substring(endPos)
    });
    
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
    }, 0);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

    return (
      <div className="profile-container">
        {/* Cover Photo Section */}
        <div className="cover-photo">
          <div className="profile-actions">
            <button 
              className="edit-btn"
              onClick={() => setShowEditForm(!showEditForm)}
            >
              {showEditForm ? <X size={18} /> : <Edit size={18} />}
              {showEditForm ? ' Cancel' : ' Edit Profile'}
            </button>
            <button 
              className="password-btn"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordError("");
                setPasswordSuccess("");
              }}
            >
              <Lock size={18} />
              {showPasswordForm ? ' Cancel' : ' Password'}
            </button>
          </div>
        </div>
  
        {/* Profile Info Section */}
        <div className="profile-info">
          <div className="avatar-container" onClick={() => setShowAvatarSelector(true)}>
            <img
              src={profile.avatar || "http://localhost:8080/avatars/default.png"}
              alt={`${profile.name}'s avatar`}
              className="profile-avatar"
              onError={(e) => {
                e.target.src = "http://localhost:8080/avatars/default.png";
              }}
            />
            <div className="avatar-edit-overlay">
              <Edit size={20} color="#fff" />
            </div>
          </div>
  
          <div className="user-details">
            <h1 className="username">{profile.name}</h1>
            {profile.profile.firstName || profile.profile.lastName ? (
              <p className="name">
                {profile.profile.firstName} {profile.profile.lastName}
              </p>
            ) : null}
            
            <div className="stats">
              <div className="stat">
                <span className="stat-number">{profile.posts?.length || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profile.followersCount || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profile.followingCount || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
  
            {profile.profile.bio && (
              <p className="bio">{profile.profile.bio}</p>
            )}
  
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Edit Forms (appear below profile info when activated) */}
        {showEditForm && (
          <div className="edit-form-container">
            <form className="edit-profile-form" onSubmit={handleProfileUpdate}>
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label><User size={16} /> Username</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleInputChange}
                  required
                  minLength="3"
                  maxLength="30"
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <div className="bio-input-container">
                  <label><Smile size={16} /> Bio</label>
                  <div className="bio-input-wrapper">
                    <textarea
                      ref={bioRef}
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleInputChange}
                      maxLength="200"
                      placeholder="Tell us about yourself..."
                    />
                    <button 
                      type="button" 
                      className="emoji-picker-button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      😊
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        width={300}
                        height={350}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="save-btn">
                <Save size={16} /> Save Changes
              </button>
            </form>
          </div>
        )}
  
        {showPasswordForm && (
          <div className="edit-form-container">
            <form className="password-form" onSubmit={handlePasswordUpdate}>
              <h3>Change Password</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <button type="submit" className="save-btn">
                <Save size={16} /> Update Password
              </button>
            </form>
          </div>
        )}
  
        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button 
                className="close-modal-btn" 
                onClick={() => setShowAvatarSelector(false)}
              >
                <X size={24} />
              </button>
              <h3>Change Profile Picture</h3>
              <AvatarSelector 
                userId={profile.id}
                currentAvatar={profile.avatar}
                onSelect={handleAvatarUpdate}
              />
            </div>
          </div>
        )}
  
        {/* Tab Navigation */}
        <div className="content-tabs">
          <button
            className={`tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <Image size={18} />
            <span>Posts</span>
          </button>
          <button
            className={`tab ${activeTab === "addPost" ? "active" : ""}`}
            onClick={() => setActiveTab("addPost")}
          >
            <Image size={18} />
            <span>Add Post</span>
          </button>
          <button
            className={`tab ${activeTab === "searchUsers" ? "active" : ""}`}
            onClick={() => setActiveTab("searchUsers")}
          >
            <Search size={18} />
            <span>Search Users</span>
          </button>
        </div>
  
        {/* Tab Content */}
        <div className="tab-content-container">
          {activeTab === "posts" && (
            <DisplayPosts 
              posts={posts} 
              avatar={profile.avatar} 
              username={profile.name}
              onDeletePost={handleDeletePost}
              isCurrentUser={true}
            />
          )}
  
          {activeTab === "addPost" && (
            <div className="add-post-container">
              <AddPost
                userId={profile.id}
                onClose={() => { 
                  fetchPosts(); 
                  setActiveTab("posts"); 
                  fetchProfile(); 
                }}
              />
            </div>
          )}
  
          {activeTab === "searchUsers" && (
            <div className="search-users-container">
              <SearchUsers 
                currentUserId={profile.id} 
                refreshProfile={fetchProfile}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

export default ProfilePage;