// DiscordCallback.mjs

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const func = passport.authenticate('discord', {
  successRedirect: '/auth/Success', // Redirect after successful login
  failureRedirect: process.env.LOGIN_REDIRECT_FAILURE.replace(/{}/, "unknown") // Redirect after failed login
  // TODO: would be nice to have a reason why the login did not work (eg. banned, not in discord server, etc.)
});

const metadata = {
  type: 'GET',
  url: '/discord/callback',
  auth: false,
  role: [],
};

export { func, metadata };

/**
 * @swagger
 * /auth/discord/callback:
 *   get:
 *     tags: 
 *      - auth
 *     summary: Discord Oauth redirects the users here
 *     description: Discord Oauth redirects the users here, they are redirected to the home page if that's a failure, or to their /profile if it's a success
 *     responses:
 *       302:
 *         description: Header Location
 */