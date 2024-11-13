

const express = require('express');
const router = express.Router();

// GET route to fetch all posts
router.get('/posts', (req, res) => {
    res.status(200).json(posts);
  });

  // POST route to add a new comment to a post
router.post('/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
  
    // Find the post by id
    const post = posts.find((p) => p.id == id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
  
    // Add a new comment to the post
    const newComment = { id: post.comments.length + 1, text };
    post.comments.push(newComment);
  
    // Send the updated post back
    res.status(201).json(post);
  });
  
module.exports = router; 