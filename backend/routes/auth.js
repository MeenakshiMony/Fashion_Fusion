const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const generateAccessToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
};

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser  = new User({ username, password: hashedPassword });
  await newUser .save .then(user => res.status(201).json({ message: "User  registered successfully", user }))
  .catch(err => res.status(400).json({ error: err.message }));
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User  not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = generateAccessToken(user._id, user.username);
  res.json({ token });
});

module.exports = router;



/* const express =require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/User'); // Assuming you have a User model
const router = express.Router();

router.post('/users', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });

    // Save user to the database
    await newUser.save();

    // Create JWT Token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      'yourSecretKey', // Secret key for JWT (Use a secure one in production)
      { expiresIn: '1h' } // Set expiration time
    );

    // Send the token back in response
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      'yourSecretKey', // Use a secure secret key in production
      { expiresIn: '1h' } // Token expiry time
    );

    // Send the token back in response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}); */