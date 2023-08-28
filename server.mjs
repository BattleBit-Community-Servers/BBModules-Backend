// server.mjs
import 'dotenv/config'

import express from 'express';
import bodyParser from 'body-parser';

import session from 'express-session';

import passport from 'passport';
import './DiscordStrategy.mjs'

import { WebsiteRouter, loadPages } from './routers/WebsiteRouter.mjs'; 

import { createDB } from './database/setup.mjs';

import pool from './database/dbConfig.mjs';

const app = express();
const PORT = process.env.PORT || 2565;

const startServer = async () => {
  try {
    
    const tableNameToCheck = 'users';
    tableExists(tableNameToCheck).then((exists) => {
      if (exists) {
        console.log(`Table "${tableNameToCheck}" exists.`);
      } else {
        console.log(`Table "${tableNameToCheck}" does not exist.`);
      }
    });

    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: {
        maxAge: 86400000 //process.env.COOKIE_MAXAGE glitches, can't detect it in .env
      }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    loadPages();
    app.use('/', WebsiteRouter);

    app.use(express.static('public'));
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};


async function tableExists(tableName) {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(`SHOW TABLES LIKE ?`, [tableName]);
    connection.release();
    return results.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}


export { startServer };
