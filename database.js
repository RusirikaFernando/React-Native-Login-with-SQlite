import * as SQLite from 'expo-sqlite';

// Initialize database
export const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );
    `);
    console.log('DATABASE INITIALIZED');
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};


