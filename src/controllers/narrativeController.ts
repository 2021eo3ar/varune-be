import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { BrandNarrativeParams, buildPrompt, extractTitle } from "../utils/promptBuilder";
import { generateNarrativeFromGroq } from "../utils/groqUtil";
import { chats } from "../db/schema";
import { eq } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { UserService } from "../services";

export default class NarrativeController {
  static generateNarrative = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    try {
      const {
        industry,
        brandValues,
        targetAudience,
        brandMission,
        brandVision,
        usp,
        brandPersonality,
        toneOfVoice,
        keyProducts,
        brandStory,
        narrativeLength,
        chatId,
        parentMessageId,
        originalTask,
        newInstruction,
      } = req.body;

      const requiredShort = [
        industry,
        brandValues,
        targetAudience,
        brandMission,
        usp,
      ];
      const requiredLong = [
        industry,
        brandValues,
        targetAudience,
        brandMission,
        usp,
        brandVision,
        brandPersonality,
        toneOfVoice,
        keyProducts,
        brandStory,
      ];

      if (narrativeLength === "short") {
        if (
          requiredShort.some(
            (v) =>
              v === undefined ||
              v === null ||
              v === "" ||
              (Array.isArray(v) && v.length === 0),
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields for short narrative (industry, brandValues, targetAudience, brandMission, usp)",
          });
        }
      } else {
        if (
          requiredLong.some(
            (v) =>
              v === undefined ||
              v === null ||
              v === "" ||
              (Array.isArray(v) && v.length === 0),
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields for long narrative (all 10 parameters)",
          });
        }
      }

      const { userId, email } = req.user as { userId: number; email: string };

      let existingUser = await UserService.getUser(email);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let chatHistory: any[] = [];
      let newChatId = chatId || uuidv4();
      let origTask = originalTask;

      let lastMessageId: string | null = null;
      if (chatId) {
        const prevChats = await postgreDb
          .select()
          .from(chats)
          .where(eq(chats.chatId, chatId));
        chatHistory = prevChats.map((c: any) => c.chat);
        if (!origTask && chatHistory.length > 0) {
          const firstUserMsg = chatHistory.find((m: any) => m.role === "user");
          origTask = firstUserMsg?.content;
        }
        // For parentMessageId threading, get the last message id
        if (prevChats.length > 0) {
          lastMessageId = prevChats[prevChats.length - 1].id?.toString();
        }
      }

      const safeBrandValues = Array.isArray(brandValues)
        ? brandValues
        : [brandValues];
      const safeKeyProducts = Array.isArray(keyProducts) ? keyProducts : [];

      const promptParams: BrandNarrativeParams =
        narrativeLength === "short"
          ? {
              industry,
              brandValues: safeBrandValues,
              targetAudience,
              brandMission,
              brandVision: "",
              usp,
              brandPersonality: "",
              toneOfVoice: "",
              keyProducts: [],
              brandStory: "",
              narrativeLength: "short",
            }
          : {
              industry,
              brandValues: safeBrandValues,
              targetAudience,
              brandMission,
              brandVision,
              usp,
              brandPersonality,
              toneOfVoice,
              keyProducts: safeKeyProducts,
              brandStory,
              narrativeLength: "long",
            };

      // Build prompt with all context (originalTask, chatHistory, newInstruction)
      const prompt = buildPrompt(
        promptParams,
        chatHistory,
        origTask,
        newInstruction,
      );

      const response = await generateNarrativeFromGroq(prompt);
      // Extract title for the chat (for sidebar)
      const chatTitle = extractTitle(response);

      // Save user message first, get its id, then save assistant message with that as parent

      const [userMsgRow] = await postgreDb
        .insert(chats)
        .values([
          {
            chatId: newChatId,
            chat: JSON.stringify({
              role: "user",
              content: newInstruction || prompt,
            }),
            userId: existingUser.id,
            publicId: existingUser.publicId,
            parentMessageId: lastMessageId || parentMessageId || null,
            messageRole: "user",
            title: chatTitle, // Save the title with the first user message
          },
        ])
        .returning();

      const userMsgId = userMsgRow?.id?.toString() || null;

      await postgreDb.insert(chats).values([
        {
          chatId: newChatId,
          chat: JSON.stringify({ role: "assistant", content: response }),
          userId: existingUser.id,
          publicId: existingUser.publicId,
          parentMessageId: userMsgId,
          messageRole: "assistant",
          title: chatTitle, // Save the title with the assistant message too
        },
      ]);

      // Fetch updated user (for latest credits)
      const updatedUser = await UserService.getUser(email);

      res.status(200).json({
        success: true,
        data: {
          response,
          chatId: newChatId,
          originalTask: origTask || prompt,
          user: {
            credits: updatedUser?.credits,
            lastCreditReset: updatedUser?.lastCreditReset,
            name: updatedUser?.name,
            email: updatedUser?.email,
            publicId: updatedUser?.publicId,
            profileImage: updatedUser?.profileImage,
          },
        },
      });
    } catch (error) {
      console.error("Error generating narrative:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // API to fetch user's credits and info
  static getUserCredits = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.user as { email: string };
      let user = await UserService.getUser(email);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      // Reset credits if 24 hours have passed since last reset
      user = await UserService.resetCreditsIfNeeded(user);
      return res.status(200).json({
        success: true,
        data: {
          credits: user.credits,
          lastCreditReset: user.lastCreditReset,
          name: user.name,
          email: user.email,
          publicId: user.publicId,
          profileImage: user.profileImage,
          createdAt : user.createdAt
        },
      });
    } catch (err) {
      console.error("Error fetching user credits:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static continueChat = async (req: Request, res: Response): Promise<any> => {
    try {
      const { chatId, newInstruction } = req.body;
      if (!chatId || !newInstruction) {
        return res.status(400).json({
          success: false,
          message: "chatId and newInstruction are required",
        });
      }

      const { userId, email } = req.user as { userId: number; email: string };
      const existingUser = await UserService.getUser(email);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Get all chats for this chatId, ordered oldest to newest
      const prevChats = await postgreDb
        .select()
        .from(chats)
        .where(eq(chats.chatId, chatId));
      if (!prevChats || prevChats.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No chat history found for this chatId",
        });
      }

      // Find the first user message to extract the original task
      const chatHistory = prevChats.map((c: any) =>
        typeof c.chat === "string" ? JSON.parse(c.chat) : c.chat,
      );
      const firstUserMsg = chatHistory.find((m: any) => m.role === "user");
      const origTask = firstUserMsg?.content;
      if (!origTask) {
        return res.status(400).json({
          success: false,
          message: "Could not extract original task from chat history",
        });
      }

      // Build prompt with all context (originalTask, chatHistory, newInstruction)
      const prompt = buildPrompt(
        undefined,
        chatHistory,
        origTask,
        newInstruction,
      );
      const response = await generateNarrativeFromGroq(prompt);

      // Save user message first, get its id, then save assistant message with that as parent
      const lastMessageId =
        prevChats.length > 0
          ? prevChats[prevChats.length - 1].id?.toString()
          : null;
      const [userMsgRow] = await postgreDb
        .insert(chats)
        .values([
          {
            chatId,
            chat: JSON.stringify({ role: "user", content: newInstruction }),
            userId: existingUser.id,
            publicId: existingUser.publicId,
            parentMessageId: lastMessageId || null,
            messageRole: "user",
          },
        ])
        .returning();
      const userMsgId = userMsgRow?.id?.toString() || null;

      await postgreDb.insert(chats).values([
        {
          chatId,
          chat: JSON.stringify({ role: "assistant", content: response }),
          userId: existingUser.id,
          publicId: existingUser.publicId,
          parentMessageId: userMsgId,
          messageRole: "assistant",
        },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          response,
          chatId,
          originalTask: origTask,
        },
      });
    } catch (err) {
      console.error("Error continuing chat:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static getAllChats = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId, email } = req.user as any;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId not found",
        });
      }

      const existingUser = await UserService.getUser(email);
      if (!existingUser)
        return res.status(404).json({
          success: false,
          message: "user not found",
        });

      const allChats = await UserService.getAllChats(userId);
      if (!allChats) {
        return res.status(404).json({
          success: false,
          message: "no chats found for the user",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User's chats found successfully",
        allChats, // Each chat object now includes a 'title' field for sidebar display
      });
    } catch (error) {
      console.error("internal server error occured: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
