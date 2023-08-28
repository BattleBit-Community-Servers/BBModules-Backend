import db from '../dbConfig.mjs';

const Version = {
  getAllVersions: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM versions');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  getVersionById: async (versionId) => {
    try {
      const [rows] = await db.query('SELECT * FROM versions WHERE id = ?', [versionId]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
};

export default Version;