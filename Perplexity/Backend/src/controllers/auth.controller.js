import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User with this email or username already exists",
        success: false,
        err: "User already exists",
      });
    }

    const user = await userModel.create({
      username,
      email,
      password,
      verified: process.env.NODE_ENV === "development",
    });

    try {
      const emailVerificationToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      await sendEmail({
        to: email,
        subject: "Welcome to Perplexity! Verify your email",
        html: `
                    <p>Hi ${username},</p>
                    <p>Thank you for registering at <strong>Perplexity</strong>!</p>
                    <p>Please verify your email:</p>
                    <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">
                        Verify Email
                    </a>
                    <p>This link expires in 24 hours.</p>
                    <p>Best regards,<br>The Perplexity Team</p>
                `,
      });
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr.message);
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      err: err.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "User not found",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "Incorrect password",
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
        success: false,
        err: "Email not verified",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      err: err.message,
    });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        err: "User not found",
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      user,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      err: err.message,
    });
  }
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    if (user.verified) {
      return res.send(`
                <h1>Already Verified!</h1>
                <p>Your email is already verified.</p>
                <a href="http://localhost:5173/login">Go to Login</a>
            `);
    }

    user.verified = true;
    await user.save();

    return res.redirect("http://localhost:5173/login?verified=true");
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: err.message,
    });
  }
}

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
}
