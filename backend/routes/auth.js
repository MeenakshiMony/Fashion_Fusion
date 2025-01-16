import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/User';

const router = express.Router();

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
});

// Fetch user by ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate('posts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// Register a new user
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, 'yourSecretKey', { expiresIn: '24h' });
    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticate user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Backend route (Node.js / Express)
router.get("/users/search", async (req, res) => {
  const { query } = req.query; // Query string to search for users (e.g., by name)
  
  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" }, // Search by username (case-insensitive)
    }).select("-password"); // Exclude password from results
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Error searching for users" });
  }
});

// Follow user route
router.post("/users/:id/follow", async (req, res) => {
  const currentUserId = req.user.id; // Get the logged-in user's ID
  const followUserId = req.params.id; // Get the ID of the user to follow
  
  try {
    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(followUserId);
    
    if (!currentUser || !userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already following
    if (currentUser.following.includes(followUserId)) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Add the user to the current user's following list
    currentUser.following.push(followUserId);
    await currentUser.save();

    // Add the current user to the followed user's followers list
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.status(200).json({ message: "Successfully followed the user" });
  } catch (error) {
    res.status(500).json({ error: "Error following user" });
  }
});

export default router;
