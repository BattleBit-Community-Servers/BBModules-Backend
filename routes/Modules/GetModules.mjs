//GetModules.mjs

import prisma from '../../database/Prisma.mjs';

const metadata = {
  type: 'GET',
  url: '/GetModules',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page || 1);
    const pageSize = 5;

    const sort = req.query.sort || 'A-Z';

    let orderBy;

    if( req.query.search && req.query.search.length <= 3 ) {
      res.status(400).json({message:"search query too short"});
      return;
    }

    switch (sort) {
      case 'A-Z':
        orderBy = { Module_name: 'asc' };
        break;
      case 'Z-A':
        orderBy = { Module_name: 'desc' };
        break;
      case 'newest':
        orderBy = { Module_updated_at: 'desc' };
        break;
      case 'oldest':
        orderBy = { Module_updated_at: 'asc' };
        break;
      case 'mostDownloads':
        orderBy = { Module_downloads: 'desc' };
        break;
      case 'leastDownloads':
        orderBy = { Module_downloads: 'asc' };
        break;  
      default:
        orderBy = { Module_name: 'asc' }; // Default to 'A-Z'
    }

    let modules;
    let totalModulesCount;

    if(req.user){
      if(req.user.roles == 'ADMIN' || 'MODERATOR'){
        totalModulesCount = await prisma.modules.count({});
        modules = await prisma.modules.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: orderBy,
          select: {
            Module_id: true,
            Module_name: true,
            Module_shortdesc: true,
            Module_markdown: true,
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
      }else{
        userDiscordId = req.user.User_discord_id;

        totalModulesCount = await prisma.modules.count({
          where: {
            OR: [
              {
                versions: {
                  some: {
                    Version_approved: true,
                  },
                }
              },
              {
                users: {
                  User_discord_id: userDiscordId,
                },
              },
            ],
          }
        });
        modules = await prisma.modules.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            OR: [
              {
                versions: {
                  some: {
                    Version_approved: true,
                  },
                }
              },
              {
                users: {
                  User_discord_id: userDiscordId,
                },
              },
            ],
          },
          orderBy: orderBy,
          select: {
            Module_id: true,
            Module_name: true,
            Module_shortdesc: true,
            Module_markdown: true,
            Module_downloads: true,
            users: {
              select: {
                User_displayname: true,
                User_discord_id: true,
              },
            },
            versions: {
              where: {
                Version_approved: true,
              },
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
      }
    }else{
      totalModulesCount = await prisma.modules.count({
        where: {
          versions: {
            some: {
              Version_approved: true,
            },
          },
          OR: [
            {
              Module_name: {
                contains: req.query.search != null ? req.query.search : undefined,
              },
            },
            {
              Module_markdown: {
                contains: req.query.search != null ? req.query.search : undefined,
              }
            },
            {
              Module_shortdesc: {
                contains: req.query.search != null ? req.query.search : undefined,
              },
            },
            {
              users: {
                User_displayname: {
                  contains: req.query.search != null ? req.query.search : undefined,
                },
              },
            },
          ]
        }
      });
      modules = await prisma.modules.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          versions: {
            some: {
              Version_approved: true,
            },
          },
          OR: [
            {
              Module_name: {
                contains: req.query.search != null ? req.query.search : undefined,
              },
            },
            {
              Module_markdown: {
                contains: req.query.search != null ? req.query.search : undefined,
              }
            },
            {
              Module_shortdesc: {
                contains: req.query.search != null ? req.query.search : undefined,
              },
            },
            {
              users: {
                User_displayname: {
                  contains: req.query.search != null ? req.query.search : undefined,
                },
              },
            },
          ]
        },
        orderBy: orderBy,
        select: {
          Module_id: true,
          Module_name: true,
          Module_shortdesc: true,
          Module_markdown: true,
          Module_downloads: true,
          users: {
            select: {
              User_displayname: true,
              User_discord_id: true,
            },
          },
          versions: {
            where: {
              Version_approved: true,
            },
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
    }

    modules = modules.map(module => ({
      ...module,
      Module_shortdesc: module.Module_shortdesc ? module.Module_shortdesc.slice(0, 256) : null,
    }));
    
    const eeee = {
      results: modules,
      count: Math.ceil(totalModulesCount/pageSize)
    }
    res.status(200).json(eeee);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export { func, metadata };