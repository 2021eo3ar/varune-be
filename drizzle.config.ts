import { resolve } from "path";
import * as dotenv from "dotenv";

// Determine which env file to load
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "development"
    ? ".env.development"
    : ".env";

dotenv.config({ path: resolve(process.cwd(), envFile) });

import { envConfigs } from "./src/config/envconfig";

export default ({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: envConfigs.DB_URL,
  }
});