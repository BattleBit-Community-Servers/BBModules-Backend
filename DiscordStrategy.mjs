
import 'dotenv/config'
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import db from './database/dbConfig.mjs';

passport.serializeUser((user, done) => {
  //console.log("Serialize");
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  //console.log("Deserializing");
  const user = await DiscordUser.findById(id);
  if(user) 
    done(null, user);
});

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CLIENT_REDIRECT,
  scope: [ 'identify', 'email', 'guilds' ]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await db.query('SELECT * FROM Users WHERE User_discord_id = ?', [profile.id]);
    
    if (existingUser) {
      // Update user's access token and refresh token
      await db.query('UPDATE Users SET User_discord_access_token = ?, User_discord_refresh_token = ? WHERE User_discord_id = ?', [accessToken, refreshToken, profile.id]);
      return done(null, existingUser);
    } else {
      // Create a new user
      const newUser = {
        User_discord_id: profile.id,
        User_discord_username: profile.username,
        User_discord_access_token: accessToken,
        User_discord_refresh_token: refreshToken,
        User_discord_issued_token: new Date(),
        // Other user fields as needed
      };

      const [insertResult] = await db.query('INSERT INTO Users SET ?', newUser);
      newUser.User_id = insertResult.insertId;
      return done(null, newUser);
    }
  }
  catch(err) {
    console.log(err);
    done(err, null);
  }
}));