export const calculateAndUpdateBaseLevel = async (db, userId) => {
    try {
      // Get all creatinine values for the user
      const reports = await db.getAllAsync(
        `SELECT serumCreatinine FROM reports WHERE user_id = ?`,
        [userId]
      );
  
      let average = 0;
      if (reports.length > 0) {
        const total = reports.reduce((acc, report) => acc + report.serumCreatinine, 0);
        average = total / reports.length;
      }
  
      // Update user's base level
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