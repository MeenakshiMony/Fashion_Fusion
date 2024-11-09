// frontend/src/components/Profile.js
import React, { useEffect, useState } from "react";
import axios from "../utils/axios.jsx";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/auth/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Passing JWT token
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.username}</h1>
      <p>{profile.firstName} {profile.lastName}</p>
      <p>{profile.bio}</p>
    </div>
  );
};

export default Profile;
