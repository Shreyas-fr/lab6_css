const mongoose = require('mongoose');

// User Schema for Salt & Pepper Password Protection
// IMPORTANT: Notice that 'pepper' is NOT stored in the database!
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  salt: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
