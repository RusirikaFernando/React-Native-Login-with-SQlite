export const calculateAndUpdateBaseLevel = async (db, userId) => {
  try {
      // Fetch user's initial base level from the database
      const user = await db.getFirstAsync(
          `SELECT creatinine_base_level FROM users WHERE id = ?`,
          [userId]
      );

      if (!user) {
          throw new Error("User not found");
      }

      const baseLevel = user.creatinine_base_level; // User-entered base level

      // Get all creatinine values for the user from reports
      const reports = await db.getAllAsync(
          `SELECT serumCreatinine FROM reports WHERE user_id = ?`,
          [userId]
      );

      let total = baseLevel;
      let count = 1; // Start count with 1 to include the base level

      if (reports.length > 0) {
          total += reports.reduce((acc, report) => acc + report.serumCreatinine, 0);
          count += reports.length;
      }

      const average = total / count;

      // Update user's base level with the new calculated average
      await db.runAsync(
          `UPDATE users SET creatinine_base_level = ? WHERE id = ?`,
          [average, userId]
      );

      return average;
  } catch (error) {
      console.error("Error calculating base level:", error);
      throw error;
  }
};
