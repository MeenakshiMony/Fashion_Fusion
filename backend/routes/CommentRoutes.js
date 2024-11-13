const express = require('express');
const router = express.Router();
const Comment = require("../model/Comment");
const Post = require("../model/Post");

// POST route to create a comment for a post
router.post("/:postId", async (req, res) => {
  const { content, username } = req.body;
  const newComment = new Comment({ content, username });
  await newComment.save()
    .then(async comment => {
      await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });
      res.status(201).json(comment);
    })
    .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;