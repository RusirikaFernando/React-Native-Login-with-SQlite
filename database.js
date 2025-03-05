import * as SQLite from 'expo-sqlite';

export const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    await db.execAsync(`PRAGMA foreign_keys = ON;`); // Enable foreign key support

    // Users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER,
        recurrence_period INTEGER,
        creatinine_base_level INTEGER
      );
    `);

    // Reports table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reports (
        report_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reportedDate TEXT NOT NULL,
        month TEXT NOT NULL,
        serumCreatinine REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};