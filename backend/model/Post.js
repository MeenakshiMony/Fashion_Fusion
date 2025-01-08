import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxLength:1000},
  file: { type: String },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  comments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Comment', default: [] },  
  tags: [{ type: String }],
  fashionCategory: { type: String, enum: ['Outfit', 'Accessory', 'StylingTips'], default: 'Outfit' },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
