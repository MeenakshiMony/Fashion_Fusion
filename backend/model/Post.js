import mongoose from 'mongoose';
import Comment from './Comment'; // Assuming you have a Comment model

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  file: { type: String },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],  
  tags: [{ type: String }],
  fashionCategory: { type: String, enum: ['Outfit', 'Accessory', 'StylingTips'], default: 'Outfit' },
  isPinned: { type: Boolean, default: false },
  sharedCount: { type: Number, default: 0 },
}, { timestamps: true });

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
