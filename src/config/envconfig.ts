import * as dotenv from "dotenv";
import { resolve } from "path";

// Load the local env file first, then fall back to the regular .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

import { z } from "zod";

const envVarsSchema = z.object({
  PORT: z.string(),
  DB_URL: z.string(),
  JWT_SECRET: z.string(),
  EXPIREATION_MINUTE: z.string(),
  BASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  CLIENT_REDIRECT_URL: z.string().optional(),
  GROQ_API: z.string().optional()
});

const envVars = envVarsSchema.parse(process.env);
export const envConfigs = {
  port: envVars.PORT || 8080,
  jwtsecret: envVars.JWT_SECRET,
  DB_URL: envVars.DB_URL,
  accessExpirationMinutes: envVars.EXPIREATION_MINUTE,
   GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,
   GOOGLE_CALLBACK_URL: envVars.GOOGLE_CALLBACK_URL,
   CLIENT_REDIRECT_URL: envVars.CLIENT_REDIRECT_URL,
   GROQ_API: envVars.GROQ_API 
};
