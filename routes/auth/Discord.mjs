import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const func = passport.authenticate('discord');

const type = "GET";
const url = "/auth/discord";
const auth = false;

export {func , type, url, auth };