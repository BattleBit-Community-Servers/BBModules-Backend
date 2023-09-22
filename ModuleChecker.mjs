import { exec } from "node:child_process";
import { promisify } from "node:util";

const execPromise = promisify(exec);

/**
 * @param {string} file
 */
export const checkModuleFile = async (file) => {
    try {
        const jsonOutput = await execPromise(`dotnet "${process.env.VERIFICATION_TOOL}" "${file}"`);

        return JSON.parse(jsonOutput);
    } catch (error) {
        return Promise.reject(`Error parsing JSON output: ${error.message}`);
    }
};
