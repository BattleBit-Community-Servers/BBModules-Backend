//GetModule.mjs

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
 *         description: A module.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The user ID.
 *                         example: 0
 *                       name:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 */

//{"Module_id":1,"Module_name":"Goaty jokes","Module_author_id":1,"Module_downloads":0,"Module_shortdesc":"How did the pig get to the hogspital? In a hambulance.","Module_markdown":"huge collection of jokes, because why not !?","Module_created_at":"2023-08-30T00:23:41.000Z","Module_updated_at":"2023-08-30T00:23:41.000Z","users":{"User_displayname":"goat_609","User_discord_id":"167555761831018496"},"versions":[{"Version_v_number":"0.1.3"},{"Version_v_number":"0.1.0"}]}
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
            Version_v_number: true
          },
        },
      },
    });

    /*if (module.users?.User_discord_id !== null) {
      module.users.User_discord_id = module.users.User_discord_id.toString();
    }*/

    res.status(200).json(module);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/GetModule/:id';
const auth = false;
const role = 9999;
export { func , type, url, auth, role };