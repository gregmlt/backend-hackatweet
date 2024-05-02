const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  text: String,
  password: String,
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
