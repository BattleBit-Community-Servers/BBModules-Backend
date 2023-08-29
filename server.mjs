// server.mjs
import 'dotenv/config'

// Express related
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';

// Discord Oauth
import passport from 'passport';
import './DiscordStrategy.mjs'

// Router
import { WebsiteRouter, loadPages } from './routers/WebsiteRouter.mjs'; 

import prisma from './database/Prisma.mjs';

const app = express();
const PORT = process.env.PORT || 2565;

const startServer = async () => {
  try {
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
      secret: "g6re-841z0/-re+0g8-8er",
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

const run = async () => {
  startServer()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
}

export { run };