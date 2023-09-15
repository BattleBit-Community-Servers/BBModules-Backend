
const func = async (req, res) => {
    // set cookie here
    if (req.isAuthenticated()) {
        const userData = {
          User_displayname: req.user.User_displayname,
          User_roles: req.user.User_roles,
        };
    
        res.cookie('userdata', JSON.stringify(userData), { maxAge: parseInt(process.env.COOKIE_MAXAGE), httpOnly: false });
      }

      res.redirect(process.env.LOGIN_REDIRECT_SUCCESS);
  };
  
  const metadata = {
    type: 'GET',
    url: '/success',
    auth: true,
    role: [''],
  };
  
  export { func, metadata };
