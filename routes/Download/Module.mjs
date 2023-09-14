// Download/Module.mjs

import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import prisma from '../../database/Prisma.mjs';

const basePath = '../../MODULES/';

const metadata = {
  type: 'GET',
  url: '/:moduleName/:version',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  let versionsQuery = {
    where: {
      modules: {
        Module_name: req.params.moduleName
      }
    },
    orderBy: {
      Version_created_at: "desc"
    },
    select: {
      Version_v_number: true,
      Version_file_path: true,
      Version_approved: true,
      Version_id: true,
      modules: {
        select: {
          Module_id: true,
          users: {
            select: {
              User_discord_id: true
            }
          }
        }
      }
    }
  };

  if (req.user && req.user.User_roles !== 'ADMIN' && req.user.User_roles !== 'MODERATOR') {
    // Logged in users that are not admins or moderators can only see approved or their own versions
    versionsQuery.where = {
      ...versionsQuery.where,
      OR: [
        {
          modules: {
            users: {
              User_discord_id: req.user.User_discord_id
            }
          },
        },
        { Version_approved: true }
      ]
    };
  } else if (!req.user) {
    // If user is not logged in, only approved versions are shown
    versionsQuery.where = {
      ...versionsQuery.where,
      Version_approved: true
    };
  }

  if (req.params.version != 'latest') {
    // If you specify the version manually
    const searchCondition = {
      Version_v_number: req.params.version,
    }

    versionsQuery.where = {
      ...versionsQuery.where,
      ...searchCondition
    };
  }

  let version;
  try {
    version = await prisma.versions.findFirstOrThrow(versionsQuery)
    if (!version || !version.Version_file_path || version.Version_file_path === '') {
      throw new Error(`No path for version ${req.params.version} of module ${req.params.moduleName} found.`);
    }
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(404).json({ message: 'No version found.' });
    return;
  }

  const fp = path.join(__dirname, basePath, version.Version_file_path);
  console.log(fp);
  res.download(fp, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(404).json({ message: 'File not found' });
      return;
    }
  });
};

async function addCount(moduleID, versionID) {
  await prisma.modules.update({
    where: {
      Module_id: parseInt(moduleID),
    },
    data: {
      Module_downloads: {
        increment: 1,
      },
    },
  });

  // Increment download count for version
  await prisma.versions.update({
    where: {
      Version_id: versionID,
    },
    data: {
      Version_downloads: {
        increment: 1,
      },
    },
  });
}

export { func as func, metadata };