import mongoose from 'mongoose';
import Comment from './Comment'; // Assuming you have a Comment model

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  file: { type: String },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
  ]  // Reference to Comment model
}, { timestamps: true });

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
