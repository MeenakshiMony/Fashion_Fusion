import express from 'express';
const router = express.Router();
import Post from '../model/Post';
import Comment from '../model/Comment';

// Retrieve all comments or comments for a specific post
router.get('/comments', async (req, res) => {
  try{
    const { postId } = req.query;
    let comments;
    if(postId) {
      comments = await Comment.find({postId});
    } else {
      comments = await Comment.find();
    }
    res.status(200).json(comments);
  } catch(error) {
    res.status(500).json({ message: 'Error retrieving comments', error});
  }

});

router.get('/comments/:postId', async(req,res) => {
  const { postId } = req.params;// Extract postId from route parameters
  try {
    const comments = await Comment.find({ postId }); // Query comments by postId
    if(comments.length === 0) {
      return res.status(404).json({ message: 'No comments found for this post.'});
    }
    res.status(200).json(comments); // Respond with the retrieved comments
  } catch(error) {
    res.status(500).json({ message: 'Error retrieving comments', error});
  }
})

export default router;

