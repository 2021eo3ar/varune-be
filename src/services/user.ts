import { eq } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { chats, users } from "../db/schema";

export default class UserService {

  static getUser = async (email: string) => {
    try {
      const [user] = await postgreDb
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("some error occured: ", error);
    }
  };

  static getAllChats = async (publicId: string) => {
    try {
      // Fetch all chats for the user, ordered by createdAt (oldest to newest)
      const allChats = await postgreDb
        .select()
        .from(chats)
        .where(eq(chats.publicId, publicId))
        .orderBy(chats.chatId, chats.createdAt);

      // Group by chatId
      const grouped: Record<string, any[]> = {};
      for (const chat of allChats) {
        const chatId = chat.chatId;
        if (!grouped[chatId]) grouped[chatId] = [];
        grouped[chatId].push(chat);
      }

      // Convert to array of { chatId, chats: [...] }
      const result = Object.entries(grouped).map(([chatId, chats]) => ({
        chatId,
        chats,
      }));
      return result;
    } catch (error) {
      console.error("error occured while fetching chats:", error);
    }
  };

  static updateCredits = async (userId: number, credits: number) => {
    try {
      await postgreDb
        .update(users)
        .set({ credits })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating credits:", error);
    }
  };

  static resetCreditsIfNeeded = async (user: any, dailyLimit = 10) => {
    const now = new Date();
    const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : null;
    // Reset if never set or more than 24 hours have passed
    const needsReset = !lastReset || (now.getTime() - lastReset.getTime() >= 24 * 60 * 60 * 1000);
    if (needsReset) {
      await postgreDb
        .update(users)
        .set({ credits: dailyLimit, lastCreditReset: now })
        .where(eq(users.id, user.id));
      user.credits = dailyLimit;
      user.lastCreditReset = now;
    }
    return user;
  };

  static insertUser = async ({ name, email, profileImage }) => {
    try {
        const [newUser] = await postgreDb
          .insert(users)
          .values({
            name,
            email,
            profileImage,
          })
          .returning({
            id : users.id,
            name: users.name,
            email: users.email,
            profileImage: users.profileImage,
            publicId: users.publicId,
            credits: users.credits,
            lastCreditReset: users.lastCreditReset,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
          });
          console.log(newUser)
          return newUser[0];
    } catch (error) {
        console.error("some error occured :",error)
    }
  };
}
