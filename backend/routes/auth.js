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

// Search users by username
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query; // Get the search term from query parameters

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for users whose username matches or partially matches the query
    const users = await User.find(
      { username: { $regex: query, $options: "i" } }, // Case-insensitive search
      { password: 0, __v: 0 } // Exclude sensitive fields
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of matching users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Follow/Unfollow user route
router.post("/users/:id/follow", async (req, res) => {
  const currentUserId = req.user.id; // Get the logged-in user's ID
  const followUserId = req.params.id; // Get the ID of the user to follow/unfollow

  try {
    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(followUserId);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current user is already following the target user
    const isFollowing = currentUser.following.includes(followUserId);

    if (isFollowing) {
      // Unfollow the user
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== followUserId
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUserId
      );
      await currentUser.save();
      await userToFollow.save();

      return res.status(200).json({ message: "Successfully unfollowed the user" });
    } else {
      // Follow the user
      currentUser.following.push(followUserId);
      userToFollow.followers.push(currentUserId);
      await currentUser.save();
      await userToFollow.save();

      return res.status(200).json({ message: "Successfully followed the user" });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    res.status(500).json({ error: "Error following/unfollowing user" });
  }
});

export default router;
