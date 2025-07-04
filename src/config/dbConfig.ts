import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import postgres from "postgres";
import * as schema from "../db/schema";
import { envConfigs } from "./envconfig";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load the local env file first, then fall back to the regular .env
// dotenv.config({ path: resolve(process.cwd(), '.env.local') });
// dotenv.config();

// Use Pool for connection pooling
const pool = new Pool({
  connectionString: envConfigs.DB_URL,
  max: 10, // pool size
  idleTimeoutMillis: 20000, // 20 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
});

pool
  .connect()
  .then((client) => {
    client.release();
    console.log("PostgreSQL pool connected successfully");
  })
  .catch((err) => {
    console.log("Error connecting the pool", err);
  });

// Use the pool with Drizzle

const postgreDb = drizzle(pool, { schema: { ...schema } });

export default postgreDb;
export { pool };
