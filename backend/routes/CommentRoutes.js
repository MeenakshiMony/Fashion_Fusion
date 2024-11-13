const express = require('express');
const router = express.Router();
const Post = require('../model/Post');
const Comment = require('../model/Comment');

router.post('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;  // The ID of the post you are adding a comment to
  const { user, content } = req.body;  // Comment data

  try {
    // Create a new comment
    const newComment = new Comment({ postId, user, content });

    // Save the comment
    await newComment.save();

    // Push the comment ID to the Post's comments array
    const post = await Post.findById(postId);
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', newComment });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
});


module.exports = router;

