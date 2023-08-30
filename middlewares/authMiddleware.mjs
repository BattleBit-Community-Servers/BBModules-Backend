//authMiddleWare.mjs

const authMiddleware = (auth, role) => {
  return async (req, res, next) => {
    if (!auth) {
      return next();
    }
    try {
      ensureAuthenticated(req, res, next, role);
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

function ensureAuthenticated(req, res, next, role) {
  if (req.isAuthenticated()) {
    if (!role || role.includes('') || role.includes(req.user.User_roles)) {
      return next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
}

export { authMiddleware };