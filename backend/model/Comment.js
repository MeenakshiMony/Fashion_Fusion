
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },  // Number of likes on the comment
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CommentModel = mongoose.model('Comment', commentSchema);

export default CommentModel;

