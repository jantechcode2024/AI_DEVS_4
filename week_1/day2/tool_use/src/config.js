import { resolve } from 'path';
import { mkdir } from 'fs/promises';
import { resolveModelForProvider } from "../../../config.js";

export const sandbox = {
    root: resolve(import.meta.dirname, "..", "sandbox")
}

await mkdir(sandbox.root, { recursive: true });

export const api = {
    model: resolveModelForProvider("stepfun/step-3.5-flash:free"),
    instructions: `You are a helpful assistant with access to a sandboxed filesystem. 
  You can only list files within the sandbox.
  Always use the available tools to interact with files.
  Be concise in your responses.`
  };