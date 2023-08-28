import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: process.env.DB_WFCON,
  connectionLimit: process.env.DB_CONNLIM,
  queueLimit: process.env.DB_QUEUEL,
});

export default pool;