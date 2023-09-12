//GetModule.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID parameter. Must be a number.' });
    }
    const module = await prisma.modules.findFirst({
      where: {
        Module_id: id,
      },
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
            Version_v_number: true,
            Version_approved: true,
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
    });

    let targetUserDiscordId = "";
    let role = false;

    if (req.user) {
      targetUserDiscordId = req.user.User_discord_id;
      if (req.user.roles == 'ADMIN' || 'MODERATOR') role = true;
    }

    const modifiedModule = {
      ...module,
      versions: module.versions.filter((version) => {
        return (
          version.Version_approved === true ||
          module.users.User_discord_id === targetUserDiscordId ||
          role
        );
      }),
    };

    res.status(200).json(modifiedModule);
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
