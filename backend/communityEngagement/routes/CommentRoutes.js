import express from 'express';
import CommentModel from '../model/Comment.js';
import PostModel from '../model/Post.js';

const router = express.Router();

export default (app) => {
    // Add a comment to a post
    router.post('/:postId', async (req, res) => {
        const { postId } = req.params;
        const { userId, content } = req.body;

        // Validate input
        if (!userId || !content) {
            return res.status(400).json({ error: 'User ID and content are required' });
        }

        try {
            // Check if post exists
            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Create a new comment
            const comment = new CommentModel({ postId, user: userId, content });
            await comment.save();

            // Update the post to include the new comment
            await PostModel.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

            res.json(comment);
        } catch (error) {
            console.error("Error adding comment:", error);
            res.status(500).json({ error: "Failed to add comment" });
        }
    });

    // Attach the router to the app
    app.use('/api/comments', router);
};
