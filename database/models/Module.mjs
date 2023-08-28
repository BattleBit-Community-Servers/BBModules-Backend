import db from '../dbConfig.mjs';

const Module = {
  getAllModules: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM modules');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  getModuleById: async (moduleId) => {
    try {
      const [rows] = await db.query('SELECT * FROM modules WHERE id = ?', [moduleId]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
};

export default Module;