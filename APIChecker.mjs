// APIChecker.mjs

import chalk from 'chalk';
import { exec } from 'child_process';
const directoryPath = "/home/apirunner/htdocs/apirunner.mevng.net/APIChecker/";

class checker{
  
  static async check(file){
    return new Promise((resolve, reject) => {
      var ModuleVerif = exec('dotnet ./BBRAPIModuleVerfication.dll '+file, {
        shell: true,
        detached: true,
        cwd: directoryPath
      });

      let jsonOutput = '';
      ModuleVerif.stdout.on('data', (data) => {
        jsonOutput += data.toString();
      });

      ModuleVerif.on('close', (code) => {
        try {
          const parsedJson = JSON.parse(jsonOutput);
          resolve(parsedJson)
        } catch (error) {
          reject(`Error parsing JSON output: ${error.message}`);
        }
      });
    });
  }
} 

export default checker;