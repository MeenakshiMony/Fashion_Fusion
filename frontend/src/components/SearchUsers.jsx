import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/SearchUsers.css";

export default function UserSearch({ currentUserId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());

  useEffect(() => {
    // Fetch all users and check followed status
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        setSearchResults(res.data.filter((user) => user._id !== currentUserId));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.get(`http://localhost:8080/users/search?query=${searchTerm}`);
      setSearchResults(response.data); // Set the search results
    } catch (error) {
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const response = await axios.post(`/users/${userId}/follow`);
      if (response.data.message === "Successfully followed the user") {
        setFollowedUsers((prev) => new Set(prev).add(userId));
      } else if (response.data.message === "Successfully unfollowed the user") {
        setFollowedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
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
        <button type="submit" className="search-button">Search</button>
      </form>
      <div className="search-results">
        {searchResults.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="user-avatar" />
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
