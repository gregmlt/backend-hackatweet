var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { checkBody } = require("../modules/checkBody");

// ! ROUTES
// * Middleware
function verificationMiddleware(req, res, next) {
  const newUser = new User({
    firstname: req.body.firstname,
    username: req.body.username,
    password: req.body.password,
  });

  const validationError = newUser.validateSync();

  if (validationError) {
    console.log(validationError.errors.message);
    return res
      .status(400)
      .json({ result: false, message: validationError.errors });
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      newUser.password
    )
  ) {
    return res.status(400).json({
      result: false,
      message:
        "Le mot de passe n'est pas un mot de passe valide! Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.",
    });
  }
  next();
}

// * Sign up route

router.post("/signup", verificationMiddleware, (req, res) => {
  // Verify if username exists already
  User.findOne({ username: req.body.username }).then((data) => {
    if (data) {
      res.json({ result: false, message: "User already exist" });
    } else {
      // generate token
      const token = uid2(32);

      // crypting password
      const hash = bcrypt.hashSync(req.body.password, 10);

      //create new User
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: token,
      });

      // Save it to DB
      newUser.save().then((newUser) =>
        res.json({
          result: true,
          message: "User has been created",
          token: newUser.token,
        })
      );
    }
  });
});

// * Sign in route
router.post("/signin", (req, res) => {
  // Fields are missing
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Find user with the same username
  User.findOne({ username: req.body.username }).then((data) => {
    // Verify if password is correct with the username
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

module.exports = router;
