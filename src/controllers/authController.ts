import { Request, Response } from "express";

import { UserService } from "../services";

import { generateAuthTokens } from "../config/token";
import { OAuth2Client } from "google-auth-library";
import { envConfigs } from "../config/envconfig";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.NODE_ENV, "NODE_ENV");
export default class authController {
  // Helper for cookie options
  static getCookieOptions(): import("express").CookieOptions {
    const isProd = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" as "none" : "lax" as "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };
  }

  // POST /auth/logout
  static logout = async (req: Request, res: Response): Promise<any> => {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("user", { path: "/" });
    return res.status(200).json({ success: true, message: "Logged out" });
  };



  static googleCallback = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as {
        id: string;
        name: string;
        email: string;
        photo: string;
      };

      if (!user || !user.email) {
        return res
          .status(400)
          .json({ success: false, message: "Google user info missing" });
      }

      // Check if user exists in DB
      let userExists = await UserService.getUser(user.email);

      // If not, create the user
      if (!userExists) {
        userExists = await UserService.insertUser({
          name: user.name,
          email: user.email, // default accountStatus
          profileImage: user.photo // profileImageUrl
      });
      }

      // Generate JWT token
      const accessToken = generateAuthTokens(
        userExists.publicId,
        userExists.email
      );
      console.log(accessToken);
      // Prepare user object for response
      const { id, ...responseUser } = userExists;

      // Set HTTP-only cookie (only send token for security)
      res.cookie("accessToken", accessToken, authController.getCookieOptions());
      res.cookie("user", JSON.stringify(responseUser), {
        ...authController.getCookieOptions(),
        httpOnly: false,
      });
      console.log(envConfigs.CLIENT_REDIRECT_URL,"client redirect url")
      return res.redirect(envConfigs.CLIENT_REDIRECT_URL);
    } catch (error) {
      console.error("Error in googleCallback:", error);
      return res
        .status(500)
        .json({ success: false, message: "Google login failed" });
    }
  };
}