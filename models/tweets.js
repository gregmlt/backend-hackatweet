const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  content: {
    type: String,
    trim: [true, "no empty field"],
    maxlength: 280, // Limiter à 280 caractères
    required: true, // Champ obligatoire
    validate: {
      validator: function (value) {
        // Vérifie si la valeur est vide ou ne contient que des espaces
        return value.trim() !== "";
      },
      message:
        "Le champ text ne peut pas être vide ou ne contenir que des espaces",
    },
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
  isLiked: {
    required: false,
    type: Boolean,
    default: false,
  },
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
