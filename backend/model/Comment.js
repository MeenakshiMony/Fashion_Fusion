import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  content: { type: String, required: true, maxLength: 500 },
  likes: { type: Number, default: 0 },  
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxLength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CommentModel = mongoose.model('Comment', commentSchema);

export default CommentModel;

