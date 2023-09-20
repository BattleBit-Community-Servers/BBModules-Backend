// EditModule.mjs

import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
    if (req.user.User_is_locked) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }

    const id = parseInt(req.body.id);
    const markdown = req.body.markdown;

    let module;
    try {
        module = await prisma.modules.findFirst({
            where: {
                Module_id: id,
            },
            include: {
                users: {
                    select: {
                        User_id: true
                    },
                }
            }
        });
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).json({ message: 'Unable to query database' });
        return;
    }

    if (!module) {
        res.status(404).json({ message: 'Module not found' });
        return;
    }

    if (module.users.User_id !== req.user.User_id && req.user.User_roles !== 'ADMIN' && req.user.User_roles !== 'MODERATOR') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }

    try {
        await prisma.modules.update({
            where: {
                Module_id: id,
            },
            data: {
                Module_markdown: markdown,
            },
        });
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).json({ message: 'Unable to query database' });
        return;
    }

    res.status(200).json({ message: 'Module updated' });
};

const metadata = {
    type: 'POST',
    url: '/EditModule',
    auth: true,
    role: ['ADMIN', 'MODERATOR', 'USER'],
};

export { func, metadata };
