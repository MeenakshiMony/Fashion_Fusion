import express from 'express';
import { PostModel } from "../model/Post.js";

const router = express.Router();

// Get all posts with populated user and comments fields
router.get('/', async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate('user', 'username email')   // Populate specific user fields
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username' } // Populate comments' user field with specific fields
            });
        res.json(posts);
    } catch (error) {
        console.error(error); // For server-side debugging
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Add a new post
router.post('/', async (req, res) => {
    const { userId, content, imageUrl } = req.body;
    try {
        const post = new PostModel({ user: userId, content, imageUrl });
        await post.save();
        res.status(201).json(post); // Send 201 status for resource creation
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Like a post
router.put('/like/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.likes = (post.likes || 0) + 1; // Ensure likes defaults to 0 if undefined
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

export default router;
