const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  content: {
    type: String,
    maxlength: 280, // Limiter à 280 caractères
  },
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
