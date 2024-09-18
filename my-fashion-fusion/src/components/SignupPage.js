import React, { useState } from 'react';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <form>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={userInfo.password}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
