//DiscordStrategy.mjs

import 'dotenv/config'
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

import prisma from './database/Prisma.mjs';

passport.serializeUser((user, done) => {
  done(null, user.User_id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.users.findFirst({
    where: {
      User_id: id,
    },
  });
  if (user) {
    done(null, user);
  }
});

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CLIENT_REDIRECT,
  scope: [ 'identify', 'email', 'guilds' ]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        User_discord_id: BigInt(profile.id),
      },
    });
    if (existingUser) {
      const updatedUser = await prisma.users.update({
        where: {
          User_discord_id: BigInt(profile.id)
        },
        data: {
          User_discord_access_token: accessToken,
          User_discord_refresh_token: refreshToken,
        }
      });
      return done(null, updatedUser);
    } else {
      const newUser = await prisma.users.create({
        data: {
          User_email: profile.email,
          User_displayname: profile.username,
          User_discord_id: BigInt(profile.id), // Convert to BigInt if necessary
          User_discord_username: profile.username,
          User_discord_guilds: JSON.stringify(profile.guilds),
          User_discord_access_token: accessToken,
          User_discord_refresh_token: refreshToken,
        },
      });
      return done(null, newUser);
    }
  } catch (err) {
    console.error(err);
    done(err);
  }
}));