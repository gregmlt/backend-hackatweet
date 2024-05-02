const mongoose = require("mongoose");

const hashtagSchema = mongoose.Schema({
  //   username: String,
  //   password: String,
  //   token: String,
  //   canBookmark: Boolean,
});

const Hashtag = mongoose.model("hashtag", hashtagSchema);

module.exports = Hashtag;
