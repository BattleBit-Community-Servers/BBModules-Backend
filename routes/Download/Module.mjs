// Download/Module.mjs

import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import prisma from '../../database/Prisma.mjs';

const basePath = '../../MODULES/';

let filePath = '';

const metadata = {
  type: 'GET',
  url: '/:moduleName/:version',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  try {

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

    // If want latest version
    if(req.params.version != 'latest'){
      const searchCondition = {
        modules: {
          Module_name: req.params.moduleName,
        },
        Version_v_number: req.params.version,
      }

      versionsQuery.where = {
        ...versionsQuery.where,
        ...searchCondition
      };

      const version = await prisma.versions.findFirst(versionsQuery)

      console.log(version)

      if(version && version.Version_approved){
        filePath = version.Version_file_path;
      }

    }
    // If you specify the version manually
    else{

      const lastVersion = await prisma.versions.findMany(versionsQuery)
            
      for (let i = 0; i < lastVersion.length; i++) {
        const el  = lastVersion[i];
        if(el.Version_approved){
          filePath = el.Version_file_path;
        }
      }
    }

    // file exists ?
    if(filePath !== ''){
      const fp = path.join(__dirname, basePath, filePath);
      res.download(fp, (err) => {
        if (err) {
          res.status(404).send('File not found');
        } else {
          console.log('File download successful');
        }
      });
    }else{
      res.status(401).json({ message: 'No approved version found' });
    }
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

async function addCount(moduleID, versionID){
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
export { func, metadata };