import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const func = passport.authenticate('discord', {
  successRedirect: '/profile', // Redirect after successful login
  failureRedirect: '/' // Redirect after failed login
});

const type = "GET";
const url = "/discord/callback";
const auth = false;

export {func , type, url, auth };