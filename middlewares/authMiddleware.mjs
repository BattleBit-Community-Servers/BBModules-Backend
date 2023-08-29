//authMiddleWare.mjs

const authMiddleware = (auth, role) => {
  return async(req, res, next) => {

    if(!role) role = 0; // role => 0 to 9999, 9999 being the worst, 0 being admin


    if(!auth){
      return next();
    }
    try {
      ensureAuthenticated(req, res, next, role)
    } catch (error) {
      console.error( 'Auth middleware error:', error );
      res.status(500).json( { message: 'Internal server error.' } );
    }
  }
};


function ensureAuthenticated(req, res, next, role) {
  if (req.isAuthenticated()) {
    if(req.user.role <= role)
      return next();
  }
  res.status(401).json( { message: 'Unauthorized' } );
}

export { authMiddleware };