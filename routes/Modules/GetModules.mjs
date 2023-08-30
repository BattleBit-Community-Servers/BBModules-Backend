//GetModules.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = req.params.id;
    const modules = await prisma.modules.findMany({
      select: {
        Module_id: true,
        Module_name: true,
        Module_shortdesc: true,
        Module_downloads: true,
        users: {
          select: {
            User_displayname: true,
          },
        },
        versions: {
          select: {
            Version_v_number: true,
          },
          orderBy: {
            Version_v_number: 'desc',
          },
          take: 1,
        },
      },
    });

    res.status(200).json(modules);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/GetModules',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

export { func, metadata };