import db from '../dbConfig.mjs';

const User = {
  getAllUsers: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM users');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  getUserById: async (userId) => {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return null; // No user found with the given ID
      }
      return rows[0]; // Return the first user (should be unique by ID)
    } catch (error) {
      throw error;
    }
  },
  
};

export default User;