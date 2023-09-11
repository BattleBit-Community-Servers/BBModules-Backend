// AddModule.mjs

import { promises as fsPromises } from 'fs';
import path from 'path';
import prisma from '../../database/Prisma.mjs';
import checker from '../../APIChecker.mjs';
import Utils from '../../Utils.mjs';
import chalk from 'chalk';

async function processFile(file) {

  if(! file.name.endsWith('.cs')){
    return "BAD_EXTENSION";
  }

  const uploadPath = global.appRoot + '/TEMP/' + file.name;
  try{
    await fsPromises.writeFile(uploadPath, file.data);
    const retData = {
      path: uploadPath,
      name: file.name
    }
    return retData;
  } catch (err) {
    console.error('Error saving the file:', err);
  }
}

async function createDirectories(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fsPromises.access(dirname);
  } catch (error) {
    await createDirectories(dirname);
    try {
      await fsPromises.mkdir(dirname);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
}

async function moveFile(sourcePath, destinationPath) {
  try {
    // Ensure the destination directory and its parent directories are created
    await createDirectories(destinationPath);

    // Check if the source file exists
    const sourceExists = await fsPromises.access(sourcePath).then(() => true).catch(() => false);

    if (sourceExists) {
      await fsPromises.rename(sourcePath, destinationPath+'.cs');
    } else {
      console.error('Source file does not exist:', sourcePath);
    }
  } catch (err) {
    console.error('Error moving the file:', err);
  }
}

async function checkModule(Path, Module, UserId, name, markDown){
  const APICheck = await checker.check(Path);
  let DestinationPath = "";
  console.log(APICheck)

  if(APICheck.Errors !== null){
    console.log(chalk.red(APICheck.Errors));
  }else{

    if(Module){
      DestinationPath = global.appRoot + '/MODULES/' + UserId + '/' + Module + '/' + APICheck.Version + '/' + APICheck.Name;
    }else{
      const createdModule = await prisma.modules.create({
        data: {
          Module_name: APICheck.Name,
          Module_author_id: UserId,
          Module_shortdesc: APICheck.Description,
          Module_markdown: markDown,
        },
      });
      DestinationPath = global.appRoot + '/MODULES/' + UserId + '/' + createdModule.Module_id + '/' + APICheck.Version + '/' + APICheck.Name;
    }

    // TODO : dependencies

    await moveFile(Path, DestinationPath);
  }
}

const func = async (req, res) => {
  try {

    const { path, name } = await processFile(req.files.file);
    console.log(path, name)
    const markDown = req.body.markDown;

    const module = await prisma.modules.findUnique({
      where: {
        Module_name: name.replace('.cs', ''),
      },
      select: {
        Module_name: true,
        Module_id: true,
        users: {
          select: {
            User_discord_id: true,
          },
        },
        versions: {
          orderBy: {
            Version_created_at: "desc"
          },
          select: {
            Version_v_number: true,
          }
        }
      }
    });

    console.log('module: ')
    console.log(module)
    
    if(module){
      if(req.user.User_discord_id == module.users.User_discord_id){
        if(! Utils.arrayContainsJsonValue(module.versions,  "Version_v_number", version)){
          checkModule(path, module.Module_id, req.user.User_id, name, markDown)
        }else res.status(409).json({"code": "resource_conflict", "message": "Your module already have this version."});
      }else res.status(409).json({"code": "resource_conflict", "message": "A module with this name already exists."});
    }else{
      checkModule(path, null, req.user.User_id, name, markDown)
    }

    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'POST',
  url: '/AddModule',
  auth: false,
  role: ['ADMIN', 'MODERATOR', 'USER'],
};

export { func, metadata };

/**
 * @swagger
 * /Modules/AddModule:
 *   post:
 *     tags: 
 *      - Modules
 *     summary: Adds a new module
 *     description: Allow the user to submit a new module
 *     responses:
 *       200:
 *         description: valid
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The user ID.
 *             username:
 *               type: string
 *               description: The user name.
 */