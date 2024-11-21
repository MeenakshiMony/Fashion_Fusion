
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  // Reference to Post model
  user: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CommentModel = mongoose.model('Comment', commentSchema);

export default CommentModel;

