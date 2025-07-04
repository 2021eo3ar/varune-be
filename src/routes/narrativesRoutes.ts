import express from "express";
import { authenticate } from "passport";
import { authenticateUser } from "../middlewares";
import { checkAndDeductCredits } from "../middlewares/creditMiddleware";
import { narrativeController } from "../controllers";

const router = express.Router();

router.post(
  "/generate",
  authenticateUser,
  checkAndDeductCredits(1),
  narrativeController.generateNarrative,
);
router.get("/userChats", authenticateUser, narrativeController.getAllChats);
router.get(
  "/userCredits",
  authenticateUser,
  narrativeController.getUserCredits,
);

router.post(
  "/continueChat",
  authenticateUser,
  checkAndDeductCredits(1),
  narrativeController.continueChat,
);

export default router;
