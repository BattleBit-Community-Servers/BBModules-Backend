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
            User_discord_id: true,
          },
        },
        versions: {
          select: {
            Version_v_number: true,
            Version_approved: true,
          },
          orderBy: {
            Version_v_number: 'desc',
          },
        },
      },
    });

    let targetUserDiscordId = "";
    let role = false;

    if(req.user){
      targetUserDiscordId = req.user.User_discord_id;
      if(req.user.roles == 'ADMIN' || 'MODERATOR') role = true;
    }
    
    const modifiedModules = modules.filter((module) => {
      const hasApprovedVersion = module.versions.some(
        (version) => version.Version_approved === true || module.users.User_discord_id == targetUserDiscordId || role
      );
      return hasApprovedVersion;
    }).map((module) => ({
      ...module,
      versions: module.versions.filter((version) => version.Version_approved === true || module.users.User_discord_id == targetUserDiscordId || role)
    }));

    res.status(200).json(modifiedModules);
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