/**
 * @swagger
 * /Users/GetUser/{userId}:
 *   get:
 *     tags: 
 *      - Users
 *     summary: Retrieve the user from the given id.
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of users.
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


import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await prisma.users.findFirst({
      where: {
        User_discord_id: id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/GetUser/:id',
  auth: true,
  role: ['ADMIN', 'MODERATOR'],
};

export { func, metadata };