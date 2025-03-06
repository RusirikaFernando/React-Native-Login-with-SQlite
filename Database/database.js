// database.js
import * as SQLite from 'expo-sqlite';
import { migrations } from '../Database/migrations'; // Import migrations

// Get the current database version
const getDatabaseVersion = async (db) => {
  const result = await db.getAllAsync(`PRAGMA user_version`);
  return result[0].user_version;
};

// Set the database version
const setDatabaseVersion = async (db, version) => {
  await db.execAsync(`PRAGMA user_version = ${version}`);
};

// Apply migrations
export const applyMigrations = async (db) => {
  const currentVersion = await getDatabaseVersion(db);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Applying migration version ${migration.version}`);
      await migration.up(db);
      await setDatabaseVersion(db, migration.version);
    }
  }
};

// Initialize the database
export const initializeDatabase = async (db) => {
  try {
    // Set pragmas
    await db.execAsync(`PRAGMA journal_mode = WAL`);
    await db.execAsync(`PRAGMA foreign_keys = ON`);

    // Apply migrations
    await applyMigrations(db);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Open the database
export const openDatabase = async () => {
  const db = SQLite.openDatabase('myDatabase.db');
  await initializeDatabase(db);
  return db;
};