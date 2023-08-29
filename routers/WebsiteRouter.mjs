import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
var WebsiteRouter = express.Router();


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
      //console.log(filePath)
      const page = await import(filePath); // FIRST TODO / PATCH 4 LATER COMMENT !! @future me, remove `"file://"+` to make it work on linux
      const url = filePath.split("/routes")[1].split("/").slice(0, -1).join("/")+page.url;
      if (page.type === 'GET') WebsiteRouter.get(url, authMiddleware(page.auth, page.role), page.func);
      else if (page.type === 'POST') WebsiteRouter.post(url, authMiddleware(page.auth, page.role), page.func);
      console.log('+ ' + filePath.split('/').pop() + ' ' + page.type + ' ' + url);
    }
  }
}

async function loadPages() {
  const rootDir = path.join(__dirname, '../routes');
  console.log('Loading Web Pages :')
  await importPages(rootDir);
  console.log('Loading success.');
}

export { WebsiteRouter, loadPages };