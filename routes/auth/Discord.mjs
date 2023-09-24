// Discord.mjs

import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const func = passport.authenticate('discord');

const metadata = {
  type: 'GET',
  url: '/discord',
  auth: false,
  role: [''],
};

export { func, metadata };

/**
 * @swagger
 * /auth/discord:
 *   get:
 *     tags: 
 *      - auth
 *     summary: Redirects to discord auth page, with the right parameters
 *     description: Allow the user to log-in via discord Oauth
 *     responses:
 *       302:
 *         description: Header Location
 */