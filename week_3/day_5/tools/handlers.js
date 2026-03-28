import { AI_DEVS_API_KEY } from "../../../config.js";

import path from "node:path";
import { readFile, writeFile } from "fs/promises";


const VERIFY_URL = "https://hub.ag3nts.org/verify";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function postDocumentationApi(url, body) {
  console.log("Calling API with body -->", body)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  console.log("API response --> ", data);
  await sleep(2000);
  return data;

}

const SANDBOX_ROOT = path.resolve(process.cwd(), "./workspace");


export const handlers = {

  async call_api({ url, query }) {
    return postDocumentationApi(url, {
      apikey: AI_DEVS_API_KEY,
      query: query
    });
  },

  async verify({ moves }) {
    console.log('Verifying logs with hub', moves);
    return postDocumentationApi(
      VERIFY_URL,
      {
        apikey: AI_DEVS_API_KEY,
        task: "savethem",
        answer: moves
      }

    );
  },

  async write_file({ relativePath, content }) {
    console.log("Writing file with relative path ", path)
    const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
    console.log('writing file to ', fullPath)
    await writeFile(fullPath, content, "utf-8");
    return { success: true, message: `File written: ${path}` };
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