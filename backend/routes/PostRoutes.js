import express from 'express';
const router = express.Router();
import PostModel from '../model/Post'; // Import the Post model
import Comment from '../model/Comment'; // Import the Comment model (make sure it's defined)


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

// GET: Fetch comments for a specific post
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    // Find the post by ID and populate its comments
    const post = await Post.findById(postId).populate('comments');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post.comments); // Return the comments
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments', error });
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
    post.comments.push(newComment._id);

    // Save the post with the updated comments array
    await post.save();

    // Fetch the updated post with populated comments to return as response
    const updatedPost = await PostModel.findById(id).populate('comments');

    // Respond with the updated post
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});


export default router;
