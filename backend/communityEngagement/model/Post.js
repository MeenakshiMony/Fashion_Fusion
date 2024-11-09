const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  // comments: [{ user: String,
  //   content: String, }]
}, { timestamps: true });

const PostModel = mongoose.model('Post', postSchema);
module.exports = {PostModel};