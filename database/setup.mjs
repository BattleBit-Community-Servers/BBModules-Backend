import db from './dbConfig.mjs';

const createDB = async () => {
  try {
    
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        User_id INT AUTO_INCREMENT PRIMARY KEY,
        User_roles JSON NOT NULL,
        User_displayname VARCHAR(255),
        User_email VARCHAR(255) UNIQUE NOT NULL,
        User_is_banned BOOLEAN DEFAULT false,
        User_is_locked BOOLEAN DEFAULT false,
        User_discord_id BIGINT,
        User_discord_username VARCHAR(255),
        User_discord_guilds JSON,
        User_discord_access_token VARCHAR(255),
        User_discord_refresh_token VARCHAR(255),
        User_discord_issued_token TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        User_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        User_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createModulesTableQuery = `
      CREATE TABLE IF NOT EXISTS modules (
        Module_id INT AUTO_INCREMENT PRIMARY KEY,
        Module_name VARCHAR(255) UNIQUE NOT NULL,
        Module_author_id INT,
        Module_downloads INT DEFAULT 0,
        Module_shortdesc TEXT,
        Module_markdown TEXT,
        Module_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Module_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (Module_author_id) REFERENCES users(User_id)
      );
    `;

    const createVersionsTableQuery = `
      CREATE TABLE IF NOT EXISTS versions (
        Version_id INT AUTO_INCREMENT PRIMARY KEY,
        Version_module_id INT,
        Version_v_number VARCHAR(20) NOT NULL,
        Version_file_path VARCHAR(255),
        Version_approved BOOLEAN DEFAULT false,
        Version_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Version_module_id) REFERENCES modules(Module_id)
      );
    `;

    const createDependenciesTableQuery = `
      CREATE TABLE IF NOT EXISTS dependencies (
        Dependency_id INT AUTO_INCREMENT PRIMARY KEY,
        Dependency_version_id INT UNIQUE,
        Dependency_type ENUM('optional', 'required', 'binary') NOT NULL,
        Dependency_binary_text TEXT,
        Dependency_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Dependency_version_id) REFERENCES versions(Version_id)
      );
    `;


    await db.query(createUserTableQuery);
    await db.query(createModulesTableQuery);
    await db.query(createVersionsTableQuery);
    await db.query(createDependenciesTableQuery);
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the database connection after setup
    db.end();
  }
};

// Call the setup function to initialize tables
export { createDB };