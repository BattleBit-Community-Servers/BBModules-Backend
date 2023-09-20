// APIChecker.mjs

import { exec } from 'child_process';

class checker{
  static async check(file){
    return new Promise((resolve, reject) => {
      var verifyProcess = exec(`dotnet "${process.env.VERIFICATION_TOOL}" "${file}"`, {
        shell: true,
        detached: true
      });

      let jsonOutput = '';
      verifyProcess.stdout.on('data', (data) => {
        jsonOutput += data.toString();
      });

      verifyProcess.on('close', (code) => {
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