import mongoose from 'mongoose';

 const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true ,trim:true},
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  comments: {type: [mongoose.Schema.Types.ObjectId], ref: 'Comment'},
  email: { type: String, required: true, unique: true ,trim:true},
  password: { type: String, required: true }, //hashed password
  avatar: { type: String },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
  },
  followersCount: { type: Number, default: 0 },  // To track followers
  followingCount: { type: Number, default: 0 },  // To track following users
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }],  // Posts liked by the user
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;

/*
improvement to made:
 -add saved outfits field to display this on profile
*/
