//GetModules.mjs

import prisma from '../../database/Prisma.mjs';

const metadata = {
  type: 'GET',
  url: '/GetModules',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const GetModules = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const pageSize = parseInt(process.env.MODULES_PER_PAGE || 12);

    const sort = req.query.sort || 'A-Z';

    let orderBy;

    if (req.query.search && req.query.search.length <= 3) {
      res.status(400).json({ message: "search query too short" });
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

    // Base query
    let modulesQuery = {
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
            Version_created_at: 'desc',
          },
        },
      }
    };

    const filter = req.query.filter || 'all';
    if (filter == 'unapproved') {
      modulesQuery.where = {
        ...modulesQuery.where,
        versions: {
          some: {
            Version_approved: false
          }
        }
      };
    }

    // By default, for cases not handled in the if statements below (eg. for admin, moderator), all modules are shown

    if (req.user && req.user.User_roles != 'ADMIN' && req.user.User_roles != 'MODERATOR') {
      // Logged in non-admin and non-moderator users can only see modules they have submitted or modules that have been approved

      const ownerCondition = {
        OR: [
          {
            Version_approved: true,
          },
          {
            modules: {
              users: {
                User_discord_id: req.user.User_discord_id
              }
            }
          }
        ]
      };

      modulesQuery.select.versions.where = {
        ...modulesQuery.select.versions.where,
        ...ownerCondition
      };
    } else if (!req.user) {
      // Non logged in users can only see modules that have been approved
      const approvedCondition = {
        Version_approved: true,
      };

      modulesQuery.select.versions.where = {
        ...modulesQuery.select.versions.where,
        ...approvedCondition
      };
    }

    // Search condition
    if (req.query.search) {
      const searchCondition = {
        OR: [
          {
            Module_name: {
              contains: req.query.search,
            },
          },
          {
            Module_markdown: {
              contains: req.query.search,
            }
          },
          {
            Module_shortdesc: {
              contains: req.query.search,
            },
          },
          {
            users: {
              User_displayname: {
                contains: req.query.search,
              },
            },
          },
        ]
      };

      modulesQuery.where = {
        ...modulesQuery.where,
        ...searchCondition
      };
    }

    const modules = (await prisma.modules.findMany(modulesQuery)).filter(m => m.versions.length > 0);
    const moduleResultList = modules.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map(module => ({
      ...module,
      Module_shortdesc: module.Module_shortdesc ? module.Module_shortdesc.slice(0, 256) : null,
    }));

    const response = {
      results: moduleResultList,
      count: Math.ceil(modules.length / pageSize)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export { GetModules as func, metadata };