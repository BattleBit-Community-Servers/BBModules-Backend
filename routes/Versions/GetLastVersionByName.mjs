//GetLastVersionByName.mjs

import prisma from '../../database/Prisma.mjs';

const metadata = {
  type: 'GET',
  url: '/GetLastVersion/:moduleName',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  try {
    const moduleName = req.params.moduleName;
    const lastVersion = await prisma.versions.findMany({
      where: {
        modules: {
          Module_name: moduleName
        }
      },
      orderBy: {
        Version_created_at: "desc",
      },
      select: {
        Version_v_number: true,
        Version_approved: true,
        modules: {
          select: {
            users: {
              select: {
                User_discord_id: true
              }
            }
          }
        }
      }
    });

    for (let i = 0; i < lastVersion.length; i++) {
      const el = lastVersion[i];
      const lv = {
        version: el.Version_v_number
      };
      
      if(el.Version_approved){
        res.status(200).json(lv);
        break;
      } else {
        if(req.user){
          if(el.modules.users.User_discord_id == req.user.User_discord_id) res.status(200).json(lv)
          else if(req.user.User_roles === "ADMIN") res.status(200).json(lv)
          break;
        }
        
        //else res.status(401).json({ message: 'Version not approved' });
      }
    }

    
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export { func, metadata };