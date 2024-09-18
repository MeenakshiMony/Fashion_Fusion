import React, { useState } from 'react';
import '../styles/LoginPage.css';

const LoginSignupPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="login-signup">
      <h1>{isLogin ? 'Login' : 'Signup'}</h1>
      {isLogin ? (
        <form>
          <label>Email:</label>
          <input type="email" required />
          <label>Password:</label>
          <input type="password" required />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form>
          <label>Name:</label>
          <input type="text" required />
          <label>Email:</label>
          <input type="email" required />
          <label>Password:</label>
          <input type="password" required />
          <label>Body Type:</label>
          <input type="text" />
          <button type="submit">Signup</button>
        </form>
      )}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Signup' : 'Switch to Login'}
      </button>
    </div>
  );
};

export default LoginSignupPage;
