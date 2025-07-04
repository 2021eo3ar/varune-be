import { Request, Response, NextFunction } from "express";
import { UserService } from "../services";

// Middleware to check and deduct user credits
export const checkAndDeductCredits = (cost = 1) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = (req.user as any);
    let user = await UserService.getUser(email);
    user = await UserService.resetCreditsIfNeeded(user);
    if (user.credits < cost) {
      res.status(403).json({ success: false, message: "Insufficient credits. Please wait for daily reset or upgrade your plan." });
      return;
    }
    await UserService.updateCredits(user.id, user.credits - cost);
    next();
  } catch (err) {
    console.error("Credit check error:", err);
    res.status(500).json({ success: false, message: "Internal server error (credit check)" });
  }
};
