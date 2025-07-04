import { serial, pgTable, varchar, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Function to generate an 8-character UUID substring
export const generateShortUUID = () => {
  return uuidv4().replace(/-/g, "").slice(0, 8); // Remove hyphens and take first 8 characters
};

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  profileImage: varchar("profile_image", { length: 500 }),
  publicId: varchar("public_id", { length: 8 })
    .notNull()
    .unique()
    .$defaultFn(() => generateShortUUID()), // Generate 8-char UUID
  credits: integer("credits").notNull().default(50), // Daily credits
  lastCreditReset: timestamp("last_credit_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Chats table
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  chatId: uuid("chat_id").defaultRandom().notNull(),
  chat: jsonb("chat").notNull(), // Full structured message array
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  publicId: varchar("public_id", { length: 8 })
    .notNull()
    .$defaultFn(() => generateShortUUID()), // Generate 8-char UUID
  // New fields for chat continuity
  parentMessageId: varchar("parent_message_id", { length: 36 }), // UUID of previous message
  messageRole: varchar("message_role", { length: 16 }), // 'user' or 'assistant'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats), // One user can have many chats
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId], // chats.userId references users.id
    references: [users.id],
  }), // Each chat belongs to one user
}));