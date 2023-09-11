//GetLastVersionByName.mjs

import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import prisma from '../../database/Prisma.mjs';

//const basePath = '/home/apirunner/htdocs/apirunner.mevng.net/MODULES/';
const basePath = '../../MODULES/'

const metadata = {
  type: 'GET',
  url: '/:moduleName/:version',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

const func = async (req, res) => {
  try {
    const moduleName = req.params.moduleName;
    const version = req.params.version;

    if(version == 'latest'){
      const lastVersion = await prisma.versions.findMany({
        where: {
          modules: {
            Module_name: moduleName
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
      });


      let filePath = '';

      for (let i = 0; i < lastVersion.length; i++) {
        const el  = lastVersion[i];
        if(el.Version_approved){
          filePath = el.Version_file_path;
        }
      }

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
        res.status(401).json({ message: 'Version not approved' });
      }
    }else{
      const v = await prisma.versions.findFirst({
        where: {
          modules: {
            Module_name: moduleName,
          },
          Version_v_number: version,
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
      });
      let filePath = "";
      
      if(v.Version_approved){
        filePath = v.Version_file_path;
      }
      
      if(filePath !== ''){
        
        addCount(v.modules.Module_id, v.Version_id)

        const fp = path.join(__dirname, basePath, filePath);
        res.download(fp, (err) => {
          if (err) {
            res.status(404).send('File not found');
          } else {
            console.log('File download successful');
          }
        });
      }else{
        res.status(401).json({ message: 'Version not approved' });
      }
    }
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

async function addCount(moduleID, versionID){
  await prisma.modules.update({
    where: {
      Module_id: moduleID,
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