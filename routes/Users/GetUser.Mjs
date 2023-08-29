//GetUser.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = req.parems.id;
    const user = await prisma.users.findFirst({
      where: {
        User_discord_id: BigInt(id),
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/GetUser/:id';
const auth = true;
export { func , type, url, auth };