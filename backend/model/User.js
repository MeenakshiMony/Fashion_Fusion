import mongoose from 'mongoose';

 const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true ,trim:true, minlength: 3, maxlength: 30},
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  comments: {type: [mongoose.Schema.Types.ObjectId], ref: 'Comment'},
  email: { type: String, required: true, unique: true ,trim:true},
  password: { type: String, required: true }, //hashed password
  avatar: { type: String, default: 'http://localhost:8080/avatars/default.png' },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
  },
  followersCount: { type: Number, default: 0 },  // To track followers
  followingCount: { type: Number, default: 0 },  // To track following users
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }],  // Posts liked by the user
  savedOutfits: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    imageUrl: String,
    description: String,
    savedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;

