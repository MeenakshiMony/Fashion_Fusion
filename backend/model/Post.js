// Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  file: { type: String },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]  // Add this field
}, { timestamps: true });

const PostModel = mongoose.model('Post', postSchema);

module.exports = { PostModel };


/* const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  file: { type: String },
  likes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  username: { type: String }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post; */