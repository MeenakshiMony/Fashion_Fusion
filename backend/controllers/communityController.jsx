const Comment = require('../models/Comment');

// Post a comment
const postComment = async (req, res) => {
  try {
    const newComment = new Comment({
      outfitId: req.body.outfitId,
      userId: req.body.userId,
      text: req.body.text,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error posting comment', error });
  }
};

// Get comments for an outfit
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ outfitId: req.params.outfitId }).populate('userId');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

// Like a comment
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.likes += 1;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error liking comment', error });
  }
};

module.exports = {
  postComment,
  getComments,
  likeComment,
};
