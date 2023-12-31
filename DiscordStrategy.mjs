//DiscordStrategy.mjs

import 'dotenv/config';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

import prisma from './database/Prisma.mjs';

passport.serializeUser((user, done) => {
  done(null, { id: user.User_discord_id, roles: user.User_roles })
});

passport.deserializeUser(async ({ id, role }, done) => {
  const user = await prisma.users.findFirst({
    where: {
      User_discord_id: id,
    }
  });

  if (user) done(null, user)
  else done(new Error("User not found"))
});

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CLIENT_REDIRECT,
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  //console.log(profile)
  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        User_discord_id: profile.id,
      },
    });

    // if user banned
    if (existingUser && existingUser.User_is_banned) {
      return done(new Error("User is banned"));
    }

    // if user not in guild
    let inGuild = false;
    profile.guilds.forEach(element => {
      if (element.id === process.env.DISCORD_GUILD_ID) {
        inGuild = true;
        return;
      }
    });

    if (!inGuild) {
      return done(new Error("User is not in the guild. Join https://discord.gg/FTkj9xUvHh and try again."));
    }

    if (existingUser) {
      const updatedUser = await prisma.users.update({
        where: {
          User_discord_id: profile.id
        },
        data: {
          User_discord_access_token: accessToken,
          User_discord_refresh_token: refreshToken,
        }
      });
      //console.log(updatedUser)
      return done(null, updatedUser);
    } else {
      const newUser = await prisma.users.create({
        data: {
          User_displayname: profile.username,
          User_discord_id: profile.id,
          User_discord_username: profile.username,
          User_discord_access_token: accessToken,
          User_discord_refresh_token: refreshToken,
        },
      });
      //console.log(newUser)
      return done(null, newUser);
    }
  } catch (err) {
    console.error(err);
    done(err);
  }
}));