//GetVersion.mjs

import prisma from '../../database/Prisma.mjs';

const metadata = {
  type: 'GET',
  url: '/GetVersion/:id',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const v = await prisma.versions.findFirst({
      where: {
        Version_id: id,
      },
      select: {
        Version_id: true,
        Version_module_id: true,
        Version_v_number: true,
        Version_file_path: true,
        Version_approved: true,
        Version_created_at: true,
        modules: {
          select: {
            Module_id: true,
            users: {
              select: {
                User_discord_id: true,
                User_displayname: true,
              }
            }
          }
        }
      }
    });

    const version = {
      Version_id: v.Version_id,
      Version_module_id: v.Version_module_id,
      Version_v_number: v.Version_v_number,
      Version_file_path: v.Version_file_path,
      Version_approved: v.Version_approved,
      Version_created_at: v.Version_created_at,
      user: {
        User_discord_id: v.modules?.users?.User_discord_id,
        User_displayname: v.modules?.users?.User_displayname,
      }
    };

    if(version.Version_approved) res.status(200).json(version)
    else {
      if(req.user){
        if(version.user.User_discord_id == req.user.User_discord_id) res.status(200).json(version)
        else if(req.user.User_roles === "ADMIN") res.status(200).json(version)
      } else res.status(401).json({ message: 'Version not approved' });
    }
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export { func, metadata };