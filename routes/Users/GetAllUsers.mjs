//GetAllUsers.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/GetAllUsers',
  auth: true,
  role: ['ADMIN', 'MODERATOR'],
};

export { func, metadata };