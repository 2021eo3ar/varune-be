import { sql } from 'drizzle-orm';
import postgreDb from '../config/dbConfig';

async function dropAllTables() {
  try {
    await postgreDb.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    process.exit(0);
  }
}

dropAllTables(); 