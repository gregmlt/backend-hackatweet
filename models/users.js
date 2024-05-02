const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: {
    type: String,
    required: true,
  },
  token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
