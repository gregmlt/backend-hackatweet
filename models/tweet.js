const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  //   text: String,
  //   password: String,
  //   token: String,
  //   canBookmark: Boolean,
});

const Tweet = mongoose.model("tweet", tweetSchema);

module.exports = Tweet;
