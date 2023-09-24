import {exec} from "node:child_process";

/**
 * @param {string} file
 */
export const checkModuleFile = async (file) => {
    try {
        /** @type {string} */
        const jsonOutput = await new Promise((res, rej) => {
            const proc = exec(`dotnet "${process.env.VERIFICATION_TOOL}" "${file}"`, {
                encoding: 'utf8'
            });
            proc.on('error', rej);

            let output = '';
            proc.stdout.on('data', (data) => (output += data));

            proc.on('exit', (code) => {
                if (code === 0) {
                    res(output);
                } else {
                    rej(new Error(`Verification tool exited with code ${code}`));
                }
            });
        });

        return JSON.parse(jsonOutput);
    } catch (error) {
        return Promise.reject(`Error parsing JSON output: ${error.message}`);
    }
};
