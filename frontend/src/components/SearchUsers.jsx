import React, { useState } from "react";
import axios from "axios";

const SearchUsers = ({ onFollow }) => {
  const [query, setQuery] = useState(""); // Search query
  const [users, setUsers] = useState([]); // List of users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/users/search", {
        params: { query }, // Send the search query
      });
      setUsers(response.data.users); // Set the list of users
      setError("");
    } catch (error) {
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(`http://localhost:8080/users/${userId}/follow`);
      onFollow(userId); // Call the callback passed from parent to update UI
    } catch (error) {
      setError("Error following user");
    }
  };

  return (
    <div className="search-users">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p className="error">{error}</p>}

      <div className="search-results">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="user-card">
              <p>{user.username}</p>
              <button onClick={() => handleFollow(user._id)}>Follow</button>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
