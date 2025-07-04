

import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();


const groq = new Groq({ apiKey: process.env.GROQ_API });

/**
 * Generate a luxury brand narrative from Groq based on structured input.
 */
export async function generateNarrativeFromGroq(prompt: string): Promise<string> {
  const chatCompletion = await groq.chat.completions.create({
    model: "llama3-70b-8192", // Or "mixtral-8x7b-32768" if preferred
    messages: [
      {
        role: "system",
        content:
          "You are a luxury brand strategist. Always craft emotionally engaging, elegant, and aspirational brand narratives for premium clients",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return chatCompletion.choices[0]?.message?.content ?? "";
}
