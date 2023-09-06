
// Logout.mjs

const func = async (req, res) => {
  try {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/logout',
  auth: true,
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