var express = require("express");
var router = express.Router();

const Hashtag = require("../models/hashtags");
const Tweet = require("../models/tweets");
const User = require("../models/users");

// ! ROUTES
// * Middleware
function verificationMiddleware(req, res, next) {
  const newTweet = new Tweet({
    content: req.body.content,
    date: req.body.date,
  });

  const validationError = newTweet.validateSync();

  if (validationError) {
    return res
      .status(400)
      .json({ result: false, message: validationError.errors });
  }
  next();
}

// * Create a tweet

router.post("/post/tweet/:token", verificationMiddleware, async (req, res) => {
  let user_ID;

  // Find user infos who post that tweet
  const userData = await User.findOne({ token: req.params.token });
  user_ID = userData._id;

  // Create the new tweet with the user
  const newTweet = new Tweet({
    content: req.body.content,
    // TODO : changer la date, elle est à créer au moment de l'enregistrement
    date: req.body.date,
    user: user_ID,
  });

  const savedTweet = await newTweet.save();

  // Join all hastags

  const allHashtags = [];

  // All words with the first character equal to #
  const regex = /#\w+/g;
  // All the words who match the Regex
  const matches = req.body.content.match(regex);

  if (matches) {
    matches.forEach((match) => {
      allHashtags.push(match);
    });
  }

  for (let i = 0; i < allHashtags.length; i++) {
    // If the hashtag exists
    const existingHashtag = await Hashtag.findOne({ hashtag: allHashtags[i] });
    if (existingHashtag) {
      // Update the hashtag with the tweet Object ID
      await Hashtag.updateOne(
        { hashtag: allHashtags[i] },
        { $push: { tweet: savedTweet._id } }
      );
    } else {
      // Create a new hastag document with the tweet object ID
      const newHashtag = new Hashtag({
        hashtag: allHashtags[i],
        tweet: [savedTweet._id],
      });

      await newHashtag.save();
    }
  }
  res.json({
    result: true,
    message: "Tweet saved and hashtags updated/created",
  });
});

// * Like a tweet

router.post("/post/like/:token", async (req, res) => {
  let user_ID;
  let tweet_ID;

  // Find the user who like that tweet
  const userData = await User.findOne({ token: req.params.token });
  user_ID = userData._id;

  // Find the tweet which has been liked
  const tweetData = await Tweet.findOne({ _id: req.body._id });
  tweet_ID = tweetData._id;

  // Add userID to the array of likes
  const updateTweet = await Tweet.updateOne(
    { _id: tweetData._id },
    { $push: { like: user_ID }, $set: { isLiked: true } }
  );

  res.json({ result: true, message: "Tweet liked" });
});

// * Get all tweet

router.get("/get/tweet/:token", async (req, res) => {
  // All tweets in the DB
  const allTweet = await Tweet.find();

  // Obtain the objectID of the token's user
  const userData = await User.findOne({ token: req.params.token });
  const userID = userData._id;

  const tweetData = await Promise.all(
    allTweet.map(async (tweet) => {
      // Vérification de l'existence et de l'appartenance de l'utilisateur aux likes
      if (tweet.like && tweet.like.some((e) => e.equals(userID))) {
        tweet.isLiked = true; // Ajout de la propriété isLike au tweet
      }
      return tweet;
    })
  );

  res.json({ result: true, tweets: tweetData });
});

// * Delete tweet

router.delete("/delete/tweet/:id", async (req, res) => {
  const tweetID = req.params.id;

  Tweet.deleteOne({ _id: tweetID })
    .then(res.json({ result: true, message: "tweet deleted" }))
    .catch((error) => console.error(error));
});

// * Delete like

router.post("/post/tweet/:token/:id", async (req, res) => {
  try {
    // Obtain the objectID of the token's user
    const userData = await User.findOne({ token: req.params.token });
    const userID = userData._id;

    // Tweet Object Id
    const tweetID = req.params.id;

    // Have the tweet data
    const tweetData = await Tweet.findOne({ _id: tweetID });

    // Delete the User's ObjectId from the tweet's array "like"
    const tweetLike = tweetData.like.filter(
      (e) => String(e) !== String(userID)
    );

    console.log({ tweetLike });
    console.log({ tweetdata: tweetData.like });

    // Update the tweet with the like's array without UserId
    // If there is at least one like
    if (tweetLike.length > 0) {
      await Tweet.updateOne(
        { _id: tweetData._id },
        { $set: { like: tweetLike } }
      );
    } else {
      // If there is no more likes
      await Tweet.updateOne(
        { _id: tweetData._id },
        { like: tweetLike, isLiked: false }
      );
    }

    res.json({ result: true, message: "Tweet disliked" });
  } catch (error) {
    console.error("Une erreur est survenue :", error);
    res.status(500).json({
      result: false,
      message: "Une erreur est survenue lors du retrait du like du tweet",
    });
  }
});

module.exports = router;
