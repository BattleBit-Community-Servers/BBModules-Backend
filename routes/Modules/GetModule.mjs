//GetModule.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    let searchQuery = {
      include: {
        users: {
          select: {
            User_displayname: true,
            User_discord_id: true,
          },
        },
        versions: {
          orderBy: {
            Version_id: 'desc'
          },
          select: {
            Version_id: true,
            Version_v_number: true,
            Version_approved: true,
            Version_changelog: true,
            dependencies: {
              select: {
                Dependency_type: true,
                Dependency_binary_text: true,
                module: {
                  select: {
                    Module_id: true,
                    Module_name: true,
                  },
                }
              }
            }
          },
        },
      },
    };

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      searchQuery = {
        ...searchQuery,
        where: {
          Module_name: req.params.id,
        },
      };
    } else {
      searchQuery = {
        ...searchQuery,
        where: {
          Module_id: id,
        },
      };
    }

    const module = await prisma.modules.findFirst(searchQuery);
    if (!module) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    if (req.user && req.user.User_roles !== 'ADMIN' && req.user.User_roles !== 'MODERATOR') {
      // Logged in users that are not admins or moderators can only see approved or their own versions
      module.versions = module.versions.filter((version) =>
        version.Version_approved === true ||
        module.users.User_discord_id === req.user.User_discord_id
      );
    } else if (!req.user) {
      // If user is not logged in, only approved versions are shown
      module.versions = module.versions.filter((version) => version.Version_approved === true);
    }
    // If user is admin or moderator, all versions are shown, default behaviour

    res.status(200).json(module);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/GetModule/:id',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

export { func, metadata };

/**
 * @swagger
 * /Modules/GetModule/{moduleId}:
 *   get:
 *     tags:
 *      - Modules
 *     summary: Retrieve the module from the given id.
 *     description: Retrieve the module from the given id, and it's last version.
 *     responses:
 *       200:
 *         description: Successful response with Module info
 *         schema:
 *           type: object
 *           properties:
 *             Module_id:
 *               type: integer
 *               example: 1
 *             Module_name:
 *               type: string
 *               example: Goaty jokes
 *             Module_author_id:
 *               type: integer
 *               example: 1
 *             Module_downloads:
 *               type: integer
 *               example: 8474014
 *             Module_shortdesc:
 *               type: string
 *               example: How did the pig get to the hospital? In a hambulance.
 *             Module_markdown:
 *               type: string
 *               example: huge collection of jokes, because why not !?
 *             Module_created_at:
 *               type: date
 *               example: 2023-08-30T00:23:41.000Z
 *             users:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   User_displayname:
 *                     type: date
 *                     example: 2023-09-01T00:02:45.000Z
 *                   User_discord_id:
 *                     type: string
 *                     example: 159652894598456165
 *             versions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Version_v_number:
 *                     type: string
 *                     example: 0.1.3
*/

//{"users":{"User_displayname":"goat_609","User_discord_id":"167555761831018496"},"versions":[{"Version_v_number":"0.1.3"},{"Version_v_number":"0.1.0"}]}
