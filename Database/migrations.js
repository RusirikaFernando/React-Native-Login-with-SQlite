export const migrations = [
    {
      version: 1,
      up: async (db) => {
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
  
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS reports (
            report_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reportedDate TEXT NOT NULL,
            month TEXT NOT NULL,
            serumCreatinine REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
  
        await db.execAsync(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_report 
          ON reports(user_id, reportedDate, serumCreatinine)
        `);
      },
    },
    {
      version: 2,
      up: async (db) => {
        // Check if the image_uri column already exists
        const tableInfo = await db.getAllAsync(`PRAGMA table_info(reports)`);
        const hasImageUri = tableInfo.some((col) => col.name === 'image_uri');
  
        if (!hasImageUri) {
          // Add image_uri column if it doesn't exist
          await db.execAsync(`
            ALTER TABLE reports 
            ADD COLUMN image_uri TEXT
          `);
        }
      },
    },
    {
      version: 3,
      up: async (db) => {
        // Add index for faster date sorting
        await db.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_reports_date 
          ON reports(reportedDate)
        `);
      },
    },
    {
      version: 4,
      up: async (db) => {
        const tableInfo = await db.getAllAsync(`PRAGMA table_info(users)`);
        const hasNotificationId = tableInfo.some(col => col.name === 'notification_id');
        
        if (!hasNotificationId) {
          await db.execAsync(`
            ALTER TABLE users 
            ADD COLUMN notification_id TEXT
          `);
        }
      },
    },
    {
      version: 5,
      up: async (db) => {
        await db.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_user_creatinine 
          ON reports(user_id, serumCreatinine)
        `);
      },
    }
    
  ];