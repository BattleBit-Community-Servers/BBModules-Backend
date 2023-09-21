// AddModule.mjs

import { promises as fsPromises } from 'fs';
import prisma from '../../database/Prisma.mjs';
import checker from '../../APIChecker.mjs';
import Utils from '../../Utils.mjs';
import path from 'path';
import { rimraf } from 'rimraf'

async function createDirectoryRecursively(directoryPath) {
  const directories = directoryPath.split(path.sep);
  let currentPath = '';

  for (const directory of directories) {
    if (currentPath === '') {
      currentPath = directory;
    } else {
      currentPath = path.join(currentPath, directory);
    }

    try {
      await fsPromises.access(currentPath);
    } catch (error) {
      await fsPromises.mkdir(currentPath);
    }
  }
}

const func = async (req, res) => {
  if (req.user.User_is_locked) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  if (!req.files || !req.files.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  if (!req.files.file.name.toLowerCase().endsWith('.cs')) {
    res.status(400).json({ message: 'Module extension is not .cs' });
    return;
  }

  const binaryDependencies = JSON.parse(req.body.binary_dependencies);

  const uploadFolder = path.join(global.appRoot, "TEMP", Math.floor(Date.now() / 1000) + "-" + Math.floor(Math.random() * 99999999));
  const uploadPath = path.join(uploadFolder, req.files.file.name);

  await createDirectoryRecursively(uploadFolder);

  try {
    await fsPromises.writeFile(uploadPath, req.files.file.data);
  } catch (err) {
    console.error('Error saving the file:', err);
    res.status(500).json({ message: 'Unable to save file' });
    return;
  }

  //const { verificationOutput } = await spawnPromise(process.env.VERIFICATION_TOOL, [uploadPath]);
  let verificationResult;
  try {
    verificationResult = await checker.check(uploadPath);
  } catch (err) {
    console.error('Error running the verification tool:', err);
    res.status(500).json({ message: 'Unable to run verification tool' });
    return;
  }

  if (!verificationResult.Success && (!binaryDependencies || binaryDependencies.length === 0)) {
    res.status(400).json({ message: 'Verification failed with errors:\n' + verificationResult.Errors });
    rimraf(uploadFolder);
    return;
  }

  let module;
  try {
    module = await prisma.modules.findUnique({
      where: {
        Module_name: verificationResult.Name,
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
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Unable to query database' });
    rimraf(uploadFolder);
    return;
  }

  if (module) {
    if (req.user.User_discord_id == module.users.User_discord_id) {
      if (Utils.arrayContainsJsonValue(module.versions, "Version_v_number", verificationResult.Version)) {
        res.status(400).json({ "message": `The version number ${verificationResult.Name} already exists on your module ${verificationResult.Version}` });
        rimraf(uploadFolder);
        return;
      }
    } else {
      res.status(400).json({ "message": "A module with this name already exists." });
      rimraf(uploadFolder);
      return;
    }

    try {
      await prisma.modules.update({
        where: {
          Module_id: module.Module_id,
        },
        data: {
          Module_shortdesc: verificationResult.Description,
        },
      });
    } catch (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Unable to query database' });
      rimraf(uploadFolder);
      return;
    }
  }

  const moduleDependencyNames = verificationResult.RequiredDependencies.concat(verificationResult.OptionalDependencies);
  let moduleDependencies;
  try {
    moduleDependencies = await prisma.modules.findMany({
      where: {
        Module_name: {
          in: moduleDependencyNames,
        },
      },
      select: {
        Module_id: true,
        Module_name: true,
      },
    });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Unable to query database' });
    rimraf(uploadFolder);
    return;
  }

  const missingDependencies = moduleDependencyNames.filter((dependencyName) => {
    return !Utils.arrayContainsJsonValue(moduleDependencies, 'Module_name', dependencyName);
  });

  if (missingDependencies.length > 0) {
    res.status(400).json({ message: `Missing dependencies: ${missingDependencies.join(', ')}` });
    rimraf(uploadFolder);
    return;
  }

  let changelog = "Initial upload";
  if (req.body.changelog?.length > 0) {
    changelog = req.body.changelog;
  } else if (module) {
    changelog = "No changelog provided";
  }

  if (!module) {
    try {
      module = await prisma.modules.create({
        data: {
          Module_name: verificationResult.Name,
          Module_author_id: req.user.User_id,
          Module_shortdesc: verificationResult.Description,
          Module_markdown: verificationResult.Description,
        },
      });
    } catch (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Unable to query database' });
      rimraf(uploadFolder);
      return;
    }
  }

  let version;
  try {
    version = await prisma.versions.create({
      data: {
        Version_v_number: verificationResult.Version,
        Version_module_id: module.Module_id,
        Version_file_path: "",
        Version_changelog: changelog,
      }
    });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Unable to query database' });
    rimraf(uploadFolder);
    return;
  }

  if (moduleDependencies.length > 0) {
    try {
      await prisma.dependencies.createMany({
        data: moduleDependencies.map((dependency) => {
          return {
            Dependency_version_id: version.Version_id,
            Dependency_module_id: dependency.Module_id,
            Dependency_type: Utils.arrayContainsJsonValue(verificationResult.RequiredDependencies, dependency.Module_name) ? 'required' : 'optional',
          };
        }),
      });
    } catch (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Unable to query database' });
      rimraf(uploadFolder);

      try {
        await prisma.versions.delete({
          where: {
            Version_id: version.Version_id,
          },
        });
      } catch (err) { }

      return;
    }
  }

  if (binaryDependencies && binaryDependencies.length > 0) {
    try {
      await prisma.dependencies.createMany({
        data: binaryDependencies.map((binaryDependency) => {
          return {
            Dependency_version_id: version.Version_id,
            Dependency_binary_text: binaryDependency.name,
            Dependency_type: "binary"
          };
        }),
      });
    } catch (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Unable to query database' });
      rimraf(uploadFolder);

      try {
        await prisma.versions.delete({
          where: {
            Version_id: version.Version_id,
          },
        });
      } catch (err) { }

      return;
    }
  }

  const modulePath = path.join(global.appRoot, "MODULES", module.Module_id.toString(), version.Version_v_number);
  await createDirectoryRecursively(modulePath);
  const moduleFilePath = path.join(modulePath, verificationResult.Name + ".cs");

  try {
    await fsPromises.rename(uploadPath, moduleFilePath);
  } catch (err) {
    console.error('Error moving the file:', err);
    res.status(500).json({ message: 'Unable to move file' });
    rimraf(uploadFolder);

    try {
      await prisma.versions.delete({
        where: {
          Version_id: version.Version_id,
        },
      });
    } catch (err) { }

    return;
  }

  try {
    await prisma.versions.update({
      where: {
        Version_id: version.Version_id,
      },
      data: {
        Version_file_path: moduleFilePath,
      },
    });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Unable to query database' });
    rimraf(uploadFolder);

    try {
      await prisma.versions.delete({
        where: {
          Version_id: version.Version_id,
        },
      });
    } catch (err) { }

    return;
  }

  res.status(200).json({ Module_id: module.Module_id });
};

const metadata = {
  type: 'POST',
  url: '/AddModule',
  auth: true,
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