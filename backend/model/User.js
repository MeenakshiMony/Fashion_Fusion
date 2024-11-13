

// models/User.js
const mongoose = require('mongoose');
 const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true ,trim:true},
  email: { type: String, required: true, unique: true ,trim:true},
  password: { type: String, required: true }, //hashed password
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
  },
});



const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;


