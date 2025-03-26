import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/SearchUsers.css";

export default function UserSearch({ currentUserId, refreshProfile }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent page refresh

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
    } catch (error) {
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:8080/follow/${userId}`, {
        currentUserId: currentUserId, // Send current user's ID in body
      });
  
      // Update local followed users state
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(userId)) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      // Call refreshProfile() to update the Profile Page
      if (refreshProfile) refreshProfile();

    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };  

  return (
    <div className="search-container">
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

      {error && <p className="error-message">{error}</p>}

      <div className="search-results">
        {searchResults.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.username}
                className="user-avatar"
              />
              <p className="username">{user.username}</p>
            </div>
            <button
              onClick={() => handleFollowToggle(user._id)}
              className={`follow-button ${followedUsers.has(user._id) ? "unfollow" : "follow"}`}
            >
              {followedUsers.has(user._id) ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
