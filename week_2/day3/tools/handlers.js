import { AI_DEVS_API_KEY } from "../../../config.js"
import path from "node:path";
import { readFile, writeFile } from "fs/promises";

const HUB_URL = "https://hub.ag3nts.org/api/zmail";
const VERIFY_URL = "https://hub.ag3nts.org/verify";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendRequest(method, body, url = HUB_URL) {
    console.log("Sending request to hub", body);

    let res = null;
    if (method === "POST") {
        res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } else {
        res = await fetch(url, { method });
    }

    const contentType = res.headers.get("content-type") || "";

    let data;
    if (contentType.includes("application/json")) {
        data = await res.json();
    } else {
        data = await res.text();
    }
    if (!res.ok) {
        console.error("Sending request to hub - error");
        const msg =
            typeof data === "object" && data?.error?.message
                ? data.error.message
                : typeof data === "object" && data?.message
                    ? data.message
                    : `Call API request failed with status ${res.status}`;
        throw new Error(msg);
    }

    console.log("Successfully sent request to hub and receive data ", data);
    return data;
}

const SANDBOX_ROOT = path.resolve(process.cwd(), "./logs");


export const handlers = {
    async read_file({ path: relativePath }) {
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
    async write_file({ path, content }) {
        const fullPath = path.resolve(SANDBOX_ROOT, relativePath);
        await writeFile(fullPath, content, "utf-8");
        return { success: true, message: `File written: ${path}` };
    },

    async verify({ content }) {
        console.log('Verifying logs with hub', content);
        return sendRequest(
            "POST",
            {
                apikey: AI_DEVS_API_KEY,
                task: "failure",
                answer: {
                    logs: content,
                },
            },
            VERIFY_URL
        );
    },
};