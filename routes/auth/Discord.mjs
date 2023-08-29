/**
 * @swagger
 * /auth/discord:
 *   get:
 *     tags: 
 *      - auth
 *     summary: Redirects to discord auth page, with the parameters
 *     description: Allow the user to log-in via discord Oauth
 *     responses:
 *       302:
 *         description: Location
 */
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const func = passport.authenticate('discord');

const type = "GET";
const url = "/discord";
const auth = false;
const role = 9999;
export { func , type, url, auth, role };