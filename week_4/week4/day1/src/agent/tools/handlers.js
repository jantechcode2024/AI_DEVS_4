import { AI_DEVS_API_KEY } from "../../../../../config.js";
import { scrap } from "../../scraper.js";

import { fileURLToPath } from "node:url";

import path from "node:path";
import { readFile, writeFile, readdir} from "fs/promises";

const CALL_API_URL = "https://hub.ag3nts.org/verify";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SANDBOX_ROOT = path.resolve(__dirname, "../../../workspace");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postDocumentationApi(body, attempt = 1) {
    console.log("Calling API with body -->", body)
    const res = await fetch(CALL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    console.log("API response --> ", data);

    // 1) HTTP-level retry
    if (res.status === 503) {
        const headerRetry = res.headers.get("retry-after");
        const waitTime = headerRetry ? parseInt(headerRetry, 10) : (data?.retry_after ?? 30);

        console.warn(`HTTP 503. Waiting ${waitTime}s then retrying (attempt ${attempt})...`);
        await sleep(waitTime * 1000);

        return postDocumentationApi(body, attempt + 1);
    }

    // 2) API-level retry
    // Rate limit:
    if (data?.code === -985 && typeof data?.retry_after === "number") {
        const waitTime = data.retry_after;
        console.warn(`Rate limited (-985). Waiting ${waitTime}s then retrying (attempt ${attempt})...`);
        await sleep(waitTime * 1000);



        return postDocumentationApi(body, attempt + 1);
    }

    // Temporary outage:
    if (data?.code === -925) {
        const waitTime = typeof data?.retry_after === "number" ? data.retry_after : 60;
        console.warn(`Temporary outage (-925). Waiting ${waitTime}s then retrying (attempt ${attempt})...`);
        await sleep(waitTime * 1000);
        return postDocumentationApi(body, attempt + 1);
    }


    if (!res.ok || data?.error) {
        const msg =
            data?.error?.message ??
            data?.message ??
            `Call API request failed with status ${res.status}`;
        throw new Error(msg);
    }

    return data;
}


export const handlers = {
    async fetch_api_documentation() {

        return postDocumentationApi({
            apikey: AI_DEVS_API_KEY,
            task: "okoeditor",
            answer: { action: "help" },
        });
    },

    async call_api(args) {
        console.log("call_api raw args from model:", args);
        const { action, page, id, title, content, done } = args;
        if (!action) throw new Error("Action is required");
        return postDocumentationApi({
            apikey: AI_DEVS_API_KEY,
            task: "okoeditor",
            answer: {
                action: action,
                ...(page && { page }),
                ...(id && { id }),
                ...(title && { title }),
                ...(content && { content }),
                // done tylko dla zadania — nigdy dla innych stron
                ...(done && page === "zadania" && { done }),
            }

        });
    },

    async get_resource_data(args) {
        console.log("get_resource_data args:", args);
        const { tab, keyword } = args;
        if (!tab) throw new Error("Tab is required");
        if (!keyword) throw new Error("Keyword is required");

        const result = await scrap(tab, keyword);

        console.log("get_resource_data result:", result);
        return result;
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

      async list_files() {
        try {
            const files = await readdir(SANDBOX_ROOT);
            console.log("📁 Workspace files:", files);
            return { files };
        } catch {
            return { files: [] };
        }
    },
};