import { AI_DEVS_API_KEY } from "../../../../config.js";

import path from "node:path";
import { readFile, writeFile, readdir } from "fs/promises";
import { fileURLToPath } from "node:url";



const API_URL = "https://hub.ag3nts.org/verify";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SANDBOX_ROOT = path.resolve(__dirname, "../workspace");


async function postDocumentationApi(body) {
  console.log("Calling API with body -->", body)
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  console.log("API response --> ", data);
  await sleep(2000);
  return data;

}

export const handlers = {

  async call_api(args) {
    console.log("call_api raw args from model:", args);
    const { action, tool, params } = args;

    // parsuj params z JSON stringa
    let parsedParams = {};
    try {
      parsedParams = params ? JSON.parse(params) : {};
    } catch (e) {
      throw new Error(`Invalid params JSON: ${params}`);
    }

    const result = await postDocumentationApi({
      apikey: AI_DEVS_API_KEY,
      task: "foodwarehouse",
      answer: {
        action,
        tool,
        ...parsedParams
      }
    });

    if (result?.code < 0) {
      throw new Error(`API error: ${result.message}. Check params and retry.`);
    }

    return result;
  },

  async analyze_api_documentation() {

    return postDocumentationApi({
      apikey: AI_DEVS_API_KEY,
      task: "foodwarehouse",
      answer: { tool: "help" },
    });
  },


  async list_files({ path }) {
    try {
      console.log('Listing files in path ', path)
      path = SANDBOX_ROOT;
      const files = await readdir(SANDBOX_ROOT);
      console.log("📁 Workspace files:", files);
      return { files };
    } catch {
      console.error("Error listing files in path ", path);
      return { files: [] };
    }
  },

  async write_file({ relativePath, content }) {
    console.log("Writing file with relative path ", relativePath)
    const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
    console.log('writing file to ', fullPath)
    await writeFile(fullPath, content, "utf-8");
    return { success: true, message: `File written: ${relativePath}` };
  },

  async read_file({ relativePath }) {
    const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
    const relativeToRoot = path.relative(SANDBOX_ROOT, fullPath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Access denied: path is outside sandbox");
    }

    const content = await readFile(fullPath, "utf-8");
    console.log("Successfully read file", { path: relativePath });
    console.log("Content is ", content);
    return { content };
  },
};