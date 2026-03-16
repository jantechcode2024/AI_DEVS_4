import { readdir, readFile, writeFile, unlink, mkdir, stat } from "fs/promises";
import { resolveSandboxPath } from "../utils/sandbox.js";

export const handlers = {

        async list_files({path}) {
            const fullPath = resolveSandboxPath(path);
            const entries = await readdir(fullPath, { withFileTypes: true });

            return entries.map(entry => ({
                name: entry.name,
                type: entry.isDirectory() ? "directory" : "file"
            }))
        }

};