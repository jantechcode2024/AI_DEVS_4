
import { LOGS_URL } from "../../../config.js"
import fs from "node:fs/promises";
import path from "node:path";

export const LOGS_DIR = "./logs";

export async function downloadLatestLogs() {
    console.log("Fetching latest logs from ", LOGS_URL);
    
    const res = await fetch(LOGS_URL, {
        method: "GET"
    });

    if (!res.ok) {
        let msg = `Call API request failed with status ${res.status}`;
        try {
            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await res.json()
                : await res.text();

            msg =
                typeof data === "object" && data?.error?.message
                    ? data.error.message
                    : typeof data === "object" && data?.message
                        ? data.message
                        : msg;
        } catch {
            // keep fallback msg
        }

        throw new Error(msg);
    }

    // Try to get filename from Content-Disposition header
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const fileName = match?.[1] || "failure.log";

    await fs.mkdir(LOGS_DIR, { recursive: true });

    const filePath = path.join(LOGS_DIR, fileName);

    // Save response as raw file content
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    console.log(`Saved latest logs to ${filePath}`);
    return filePath;
}