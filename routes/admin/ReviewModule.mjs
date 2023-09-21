//ReviewModule.mjs

import { json } from 'express';
import prisma from '../../database/Prisma.mjs';
import { webhook, sanitize } from '../../discord/webhook.mjs';

const func = async (req, res) => {
  const reviewState = req.body;

  if (reviewState.state === true) {
    try {
      await prisma.versions.update({
        where: {
          Version_id: reviewState.id,
        },
        data: {
          Version_approved: true,
        },
      });

      const version = await prisma.versions.findUnique({
        where: {
          Version_id: reviewState.id,
        },
        select: {
          Version_v_number: true,
          modules: {
            select: {
              Module_id: true,
              Module_name: true,
              Module_author_id: true,
              Module_shortdesc: true,
              users: {
                select: {
                  User_discord_id: true,
                },
              },
            },
          },
        }
      });

      webhook(`# \`\`${sanitize(version.modules.Module_name)}\`\` by <@${sanitize(version.modules.users.User_discord_id)}> version \`\`${sanitize(version.Version_v_number)}\`\`\n\`\`\`${sanitize(version.modules.Module_shortdesc)}\`\`\`https://${process.env.FRONTEND_URL}/module/${version.modules.Module_id}`, process.env.DISCORD_WEBHOOK_USER_URL);
    } catch (error) {
      console.error('Error approving version:', error);
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }
  } else {
    try {
      await prisma.versions.delete({
        where: {
          Version_id: reviewState.id,
        }
      });
    } catch (error) {
      console.error('Error declining version:', error);
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }
  }

  res.status(200).json({ message: 'Success' });
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
