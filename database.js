import * as SQLite from 'expo-sqlite';

export const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // Ensure 'users' table exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER NOT NULL,
        recurrence_period INTEGER NOT NULL,
        creatinine_base_level INTEGER
      );
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
