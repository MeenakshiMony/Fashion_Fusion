import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import path from 'path';
import mongoose from 'mongoose';

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

  // Add input validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required' 
    });
  }

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

const avatarsDirectory = path.join(process.cwd(), "avatars");
router.use("/avatars", express.static(avatarsDirectory));

// Update user avatar
router.patch('/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate the avatar URL format
    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({ error: 'Invalid avatar URL' });
    }

    // Verify the avatar exists (optional but recommended)
    const validAvatars = [
      'avatar_1.png',
      'avatar_2.png',
      'avatar_3.png',
      'avatar_4.png',
      'avatar_5.png',
      'avatar_6.png',
      'default.png'
    ];
    
    const avatarFilename = avatar.split('/').pop();
    if (!validAvatars.includes(avatarFilename)) {
      return res.status(400).json({ error: 'Invalid avatar selection' });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, select: '-password' } // Return updated user without password
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Avatar updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Server error during avatar update' });
  }
});


// Update user profile
router.put('/usersupdate/:userId',async (req, res) => {
  try{
    const { userId } = req.params;
    const { username, email, profile } = req.body;

    //update user 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, 
        profile: {
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          bio: profile?.bio
        } },
      { new: true, select: '-password' } // Return updated user without password
    );

    if(!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user: updatedUser
    });

  }
  catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
);

router.put('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  try {
  
    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword.trim(), user.password);
    console.log('currentPassword:', currentPassword);
    console.log('user.password:', user.password);
    console.log('isMatch:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    
    if (error.name === 'CastError') {
      return res.status(401).json({ success: false, message: 'Invalid user ID format' });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during password update'
    });
  }
});

// Get user profile by ID (public info)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user but exclude sensitive information
    const user = await User.findById(userId)
      .select('-password -email -__v') // Exclude private fields
      .populate({
        path: 'posts',
        select: 'content createdAt', // Only include specific post fields
        options: { sort: { createdAt: -1 }, limit: 10 } // Get latest 10 posts
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      profile: user
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
});

export default router;
