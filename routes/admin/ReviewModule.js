//ReviewModule.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    const state = req.body.state;
    const comment = req.body.comment;
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID parameter. Must be a number.' });
    }
    
    if(state == "true"){
      const v = await prisma.versions.update({
        where: {
          Version_id: id,
        },
        data: {
          Version_approved: true,
        },
      });
    }else{
      const v = await prisma.versions.update({
        where: {
          Version_id: id,
        },
        data: {
          Version_refusedMessage: comment,
        },
      });
    }
    

    res.status(200).json(module);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'POST',
  url: '/Review',
  auth: true,
  role: ['ADMIN', 'MODERATOR'],
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
