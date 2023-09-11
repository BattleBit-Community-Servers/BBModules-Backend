//BanUser.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const target = req.params.target;
    let usr;
    if(target){
      if(target.length > 17){
        usr = await prisma.users.update({
          where: {
            User_discord_id: target,
          },
          data: {
            User_is_banned: true,
          }
        });
      }else{
        usr = await prisma.users.update({
          where: {
            User_id: parseInt(target),
          },
          data: {
            User_is_banned: true,
          }
        });
      }
    }else{
      res.status(401).json({ message: 'Missing target' });
    }

    console.log(usr)
    

    res.status(200).json(usr);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/BanUser/:target',
  auth: true,
  role: ['ADMIN', 'MODERATOR'],
};

export { func, metadata };