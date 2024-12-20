

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/User'; // Assuming you have a User model
const router = express.Router();

// GET route to fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users); // Return the data as a response
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
});

// GET: Fetch user by ID
router.get('/users/:_id/', async (req, res) => {
  const { _id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Handle case where user is not found
    }

    // Send a single response with user details and a success message
    res.status(200).json({ 
      message: 'Successfully retrieved user',
      user: user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
});



router.post('/signup', async (req, res) => {
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user ) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      'yourSecretKey', // Use a secure secret key in production
      { expiresIn: '1h' } // Token expiry time
    );

    // Send the token back in response
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}); 

export default router;