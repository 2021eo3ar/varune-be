import 'dotenv/config'; // Load environment variables from .env file
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgreDb, { pool } from './dbConfig';

async function migrateData() {
  try {
    // Run migrations from the specified folder
    await migrate(postgreDb as any, { migrationsFolder: `./drizzle` });
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Ensure the database connection is closed
    await pool.end();
    console.log("Database connection closed.");
  }
}
// Execute the migration function and handle errors
migrateData().catch((err) => {
  console.error("Unexpected error:", err); 
  process.exit(1); // Exit with a failure status
}); 