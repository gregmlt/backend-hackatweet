var express = require("express");
var router = express.Router();

const Hashtag = require("../models/hashtags");
const Tweet = require("../models/tweets");
const User = require("../models/users");

// ! ROUTES
// * Get all tweet from a hashtag
router.get("/get/all/:id", (req, res) => {
  Hashtag.find({ _id: req.params.id })
    .populate("tweet")
    .then((data) => res.json({ tweets: data[0].tweet }));
});

module.exports = router;
