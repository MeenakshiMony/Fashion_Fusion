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

// Follow a user
router.post("/follow/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user to be followed/unfollowed
    const { currentUserId } = req.body; // Extract current user's ID from the request body

    if (!currentUserId) {
      return res.status(400).json({ error: "currentUserId is required" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (currentUser.following.includes(userId)) {
      // Unfollow logic
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: userId },
        $inc: { followingCount: -1 },
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUserId },
        $inc: { followersCount: -1 },
      });

      return res.json({ message: "Successfully unfollowed user" });
    }

    // Follow logic
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId },
      $inc: { followingCount: 1 },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId },
      $inc: { followersCount: 1 },
    });

    res.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error in follow API:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Unfollow a user
router.post('/unfollow/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if not following
    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({ error: "Not following this user" });
    }

    // Perform updates using MongoDB operators
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
      $inc: { followingCount: -1 },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
      $inc: { followersCount: -1 },
    });

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error in unfollow API:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/isFollowing/:userId', async (req, res) => {
  try {
    const isFollowing = await User.exists({
      _id: req.user.id,
      following: req.params.userId,
    });

    res.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error("Error checking following status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
