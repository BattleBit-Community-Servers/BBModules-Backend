// server.mjs

import * as dotenv from 'dotenv';
dotenv.config();

// Express related
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';

// Discord Oauth
import passport from 'passport';
import './DiscordStrategy.mjs'

// Router
import { WebsiteRouter, loadPages } from './routers/WebsiteRouter.mjs'; 

// Prisma DB
import prisma from './database/Prisma.mjs';


// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.mjs';

// Chalk for beautiful term colors
import chalk from 'chalk';
const app = express();
const PORT = process.env.PORT || 2565;

const startServer = async () => {
  try {

    app.enable('trust proxy');
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: new session.MemoryStore(),
      cookie: {
        secure: true,   // HTTPS
        httpOnly: true,
        maxAge: parseInt(process.env.COOKIE_MAXAGE)
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    await loadPages();
    app.use('/', WebsiteRouter);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    app.use(express.static('public'));
    app.listen(PORT, () => {
      console.log(chalk.cyan(`Server is running on port ${PORT}`));
    });
  } catch (error) {
    console.error(chalk.red('Error starting the server:', error));
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
