const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../model/blacklist.model");

const redis = require("../config/cache");

async function registerController(req, res) {
  const { username, email, password } = req.body;

  const isAllExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isAllExist) {
    return res.status(400).json({
      message:
        isAllExist.email == email
          ? "email already exist"
          : "username already exists",
    });
  }
  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(201).json({
    message: "user registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function loginController(req, res) {
  const { email, username, password } = req.body;

  const user = await userModel
    .findOne({
      $or: [{ username }, { email }],
    })
    .select("+password");

  if (!user) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(201).json({
    message: "user loggedIn successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "user fetched successfully",
    user,
  });
}

async function logoutController(req, res) {
  const token = req.cookies.token;
  res.clearCookie("token");

  await redis.set(token, Date.now().toString(), "EX", 60 * 60);

  res.status(200).json({
    message: "logout Successfully",
  });
}


async function logoutController(req,res){
    const token = req.cookies.token
    res.clearCookie("token")


    await redis.set(token, Date.now().toString(), "EX", 60*60)

    res.status(200).json({
        message:"logout Successfully"
    })    
}

// ── GUEST LOGIN — add this function in auth.controller.js ──
// ── Guest Login ───────────────────────────────
async function guestLogin(req, res) {
  try {
    const GUEST_EMAIL    = "guest@moodify.com";
    const GUEST_PASSWORD = "guest123456";
    const GUEST_USERNAME = "Guest User";

    // Guest user exist karta hai? Nahi toh banao
    let guest = await userModel.findOne({ email: GUEST_EMAIL }); // ← userModel use karo

    if (!guest) {
      const hashed = await bcrypt.hash(GUEST_PASSWORD, 10);
      guest = await userModel.create({
        username: GUEST_USERNAME,
        email:    GUEST_EMAIL,
        password: hashed,
      });
    }

    const token = jwt.sign(
      { id: guest._id, username: guest.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Guest login successful",
      user: {
        id:       guest._id,
        username: guest.username,
        email:    guest.email,
        isGuest:  true,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  registerController,
  loginController,
  getMeController,
  logoutController,
  guestLogin
};
