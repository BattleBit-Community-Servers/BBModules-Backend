import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Utils from '../Utils.mjs';
import express from 'express';
var WebsiteRouter = express.Router();

const log = console.log;

import { authMiddleware } from '../middlewares/authMiddleware.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function importPages(dir) {
  const files = await fsPromises.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fsPromises.stat(filePath);

    if (stat.isDirectory()) {
      await importPages(filePath);
    } else if (file.endsWith('.mjs')) {
      try {
        const out = [];
        const { func, metadata } = await import(filePath);
        validateMetadata(filePath, metadata);
        
        const { type, url, auth, role } = metadata;
        const authMiddlewareFn = authMiddleware(auth, role);
        const link = filePath.split("/routes")[1].split("/").slice(0, -1).join("/")+url;

        out.push(chalk.hex('#4D8BFF').bold(`${file}`))
        if (type === 'GET') {
          WebsiteRouter.get(link, authMiddlewareFn, func)
          out.push(chalk.green(` - ${type}`))
        } else if (type === 'POST') {
          WebsiteRouter.post(link, authMiddlewareFn, func)
          out.push(chalk.blue(` - ${type}`))
        } else if (type === 'PUT') {
          WebsiteRouter.put(link, authMiddlewareFn, func)
          out.push(chalk.hex('#FF8800')(` - ${type}`))
        } else if (type === 'DELETE') {
          WebsiteRouter.delete(link, authMiddlewareFn, func)
          out.push(chalk.hex('#F93E3E')(` - ${type}`))
        }

        out.push(` - ${link}`);
        if(auth) out.push(chalk.hex('#EDCB13')(` - Auth: ${role}`));

        log(out.join('\n'));
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }
}

async function validateMetadata(filePath, metadata) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error(`Invalid metadata format in route: ${filePath}`);
  }

  const valid = await Utils.validateArgs(metadata,[ 'type', 'url', 'auth', 'role' ]);
  if(valid !== true) log(chalk.red(`Missing metadata in route: ${filePath}, see ${valid}`));

}

async function loadPages() {
  const rootDir = path.join(__dirname, '../routes');
  log(chalk.cyan('Loading Web Pages :'))
  await importPages(rootDir);
  log(chalk.greenBright('Loading success.'));
}

export { WebsiteRouter, loadPages };