import * as SQLite from 'expo-sqlite';

// Add this function to help with database migrations
export const addImageUriColumn = async (db) => {
  try {
    // Check if image_uri column exists
    const tableInfo = await db.getAllAsync(`PRAGMA table_info(reports)`);
    const hasImageUri = tableInfo.some(col => col.name === 'image_uri');
    
    if (!hasImageUri) {
      // Add image_uri column if it doesn't exist
      await db.execAsync(`
        ALTER TABLE reports 
        ADD COLUMN image_uri TEXT
      `);
      console.log("Added image_uri column to reports table");
    }
  } catch (error) {
    console.error("Error adding image_uri column:", error);
    throw error;
  }
};

export const initializeDatabase = async (db) => {
  try {
    // Set pragmas
    await db.execAsync(`PRAGMA journal_mode = WAL`);
    await db.execAsync(`PRAGMA foreign_keys = ON`);

    // Create users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER,
        recurrence_period INTEGER,
        creatinine_base_level REAL
      )
    `);

    // Create reports table with image_uri column
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reports (
        report_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reportedDate TEXT NOT NULL,
        month TEXT NOT NULL,
        serumCreatinine REAL NOT NULL,
        image_uri TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create unique index for reports
    await db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_report 
      ON reports(user_id, reportedDate, serumCreatinine)
    `);

    // Add image_uri column to existing reports table if it doesn't exist
    await addImageUriColumn(db);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};