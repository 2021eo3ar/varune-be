import express from "express";
import { authController } from "../controllers/index";
import { authenticateUser, validateRequest } from "../middlewares";
// import { AuthValidators } from "../validators/index";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
);

// Real logout route (POST for security, clears cookies)
router.post("/logout", authController.logout);

export default router;
