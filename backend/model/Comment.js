// Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: String, required: true },
  content: { type: String, required: true,trim:true },
}, { timestamps: true });

const CommentModel = mongoose.model('Comment', commentSchema);

module.exports = { CommentModel };

/* 
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true, trim: true },
  username: { type: String }
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment; */