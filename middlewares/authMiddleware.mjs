//authMiddleWare.mjs

import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

const authMiddleware = (tkk) => {
  return async(req, res, next) => {
    if(!tkk){
      return next();
    }
    try {

      ensureAuthenticated(req, res, next)

    } catch (error) {
      console.error( 'Auth middleware error:', error );
      res.status(500).json( { message: 'Internal server error.' } );
    }
  }
};


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
}

export { authMiddleware };