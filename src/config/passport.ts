import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { envConfigs } from "./envconfig";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfigs.GOOGLE_CLIENT_ID,
      clientSecret: envConfigs.GOOGLE_CLIENT_SECRET,
      callbackURL: envConfigs.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          photo: profile.photos?.[0].value,
        };
        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});
