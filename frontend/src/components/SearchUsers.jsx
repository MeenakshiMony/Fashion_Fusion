import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SearchUsers.css";

export default function UserSearch({ currentUserId, refreshProfile }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [followingList, setFollowingList] = useState([]); // New state for following list
  const [showFollowing, setShowFollowing] = useState(false); // Toggle for following list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load initial followed users
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/following/${currentUserId}`);
        const followingIds = response.data.following.map(user => user._id);
        setFollowedUsers(new Set(followingIds));
        setFollowingList(response.data.following); // Store full following list
      } catch (error) {
        console.error("Error fetching followed users:", error);
      }
    };

    if (currentUserId) {
      fetchFollowedUsers();
    }
  }, [currentUserId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`http://localhost:8080/search`, {
        params: { query: searchTerm },
      });
      setSearchResults(response.data);
      setShowFollowing(false); // Hide following list when searching
    } catch (error) {
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, e) => {
    e.stopPropagation();
    try {
      const isCurrentlyFollowing = followedUsers.has(userId);
      
      // Use the same endpoint for both actions (as per your backend)
      const response = await axios.post(`http://localhost:8080/follow/${userId}`, {
        currentUserId: currentUserId,
      });

      // Update local state based on response
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (response.data.message.includes("unfollowed")) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      // Refresh following list if showing
      if (showFollowing) {
        const updatedResponse = await axios.get(`http://localhost:8080/following/${currentUserId}`);
        setFollowingList(updatedResponse.data.following);
      }

      if (refreshProfile) refreshProfile();
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      setError("Failed to update follow status");
    }
  };

  const toggleFollowingList = () => {
    setShowFollowing(!showFollowing);
    if (!showFollowing) {
      setSearchResults([]); // Clear search results when showing following list
      setSearchTerm(""); // Clear search term
    }
  };

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        
        <button 
          onClick={toggleFollowingList}
          className="show-following-button"
        >
          {showFollowing ? "Hide Following" : "Show Following"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showFollowing ? (
        <div className="following-list">
          <h3>Users You Follow</h3>
          {followingList.length > 0 ? (
            followingList.map((user) => (
              <div key={user._id} className="user-card">
                <div 
                  className="user-info"
                  onClick={() => navigateToProfile(user._id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <p className="username" style={{ 
                    textDecoration: "underline",
                    fontWeight: "bold"
                  }}>
                    {user.username}
                  </p>
                </div>
                <button
                  onClick={(e) => handleFollowToggle(user._id, e)}
                  className="follow-button unfollow"
                >
                  Unfollow
                </button>
              </div>
            ))
          ) : (
            <p>You're not following anyone yet.</p>
          )}
        </div>
      ) : (
        <div className="search-results">
          {searchResults.map((user) => {
            const isFollowing = followedUsers.has(user._id);
            return (
              <div key={user._id} className="user-card">
                <div 
                  className="user-info"
                  onClick={() => navigateToProfile(user._id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <p className="username" style={{ 
                    textDecoration: "underline",
                    fontWeight: "bold"
                  }}>
                    {user.username}
                  </p>
                </div>
                <button
                  onClick={(e) => handleFollowToggle(user._id, e)}
                  className={`follow-button ${isFollowing ? "unfollow" : "follow"}`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}