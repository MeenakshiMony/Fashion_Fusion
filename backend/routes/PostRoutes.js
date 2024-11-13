const express = require('express');
const router = express.Router();
const PostModel = require('../model/Post'); // Import the Post model
const Comment = require('../model/Comment'); // Import the Comment model (make sure it's defined)


// GET route to fetch all posts along with populated comments
router.get('/posts', async (req, res) => {
  try {
    // Fetch all posts and populate comments field with the actual comment data
    const posts = await PostModel.find().populate('comments');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving posts", error: err.message });
  }
});


// POST route to add a new comment to a specific post
router.post('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    // Find the post by its ID
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create a new comment instance
    const newComment = new Comment({ text, post: id });

    // Save the new comment to the database
    await newComment.save();

    // Add the new comment's ObjectId to the post's comments array
    PostModel.comments.push(newComment._id);

    // Save the post with the updated comments array
    await post.save();

    // Respond with the updated post
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

module.exports = router;
