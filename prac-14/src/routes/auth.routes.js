const express = require("express");
const userModel = require("../models/user.model");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { username, email, password, bio, profileImage } = req.body;

  const isUserExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserExist) {
    return res.status(409).json({
      message:
        isUserExist.email === email
          ? "email already exist"
          : "user already exists",
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const user = await userModel.create({
    username,
    email,
    bio,
    profileImage,
    password: hash,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "user LoggedIn",
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(409).json({
      message: "user not found",
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const ispasswordValid = user.password == hash;

  if (!ispasswordValid) {
    return res.status(401).json({
      message: "password invalid",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);
  res.status(201).json({
    message: "loggedIn",
    user: {
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
});

module.exports = authRouter;
