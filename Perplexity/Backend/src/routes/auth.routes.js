import { Router } from "express";
import passport from "passport";
import { register, verifyEmail, login, getMe, logout } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login);
authRouter.post("/logout", authUser, logout);
authRouter.get("/get-me", authUser, getMe);
authRouter.get("/verify-email", verifyEmail);

// ── Google OAuth ──────────────────────────────────────────
// Step 1: Redirect user to Google
authRouter.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back here after login
authRouter.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login?error=google_failed" }),
    (req, res) => {
        // req.user is set by passport — contains { token, user }
        const { token } = req.user;

        // Set cookie same as normal login
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Redirect to frontend dashboard
        res.redirect("http://localhost:5173/");
    }
);

export default authRouter;