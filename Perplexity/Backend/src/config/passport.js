import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name  = profile.displayName;

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                username: name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString().slice(-4),
                email,
                password: Math.random().toString(36) + "GOOGLE",
                verified: true,
                googleId: profile.id,
            });
        } else if (!user.verified) {
            user.verified = true;
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return done(null, { token, user });

    } catch (err) {
        return done(err, null);
    }
}));

export default passport;