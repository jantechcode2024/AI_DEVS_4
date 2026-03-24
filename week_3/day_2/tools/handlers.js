import { AI_DEVS_API_KEY } from "../../../config.js";
import { askYesNo } from "./cliPrompt.js";

const VERIFY_URL = "https://hub.ag3nts.org/verify";
const SHELL_URL = "https://hub.ag3nts.org/api/shell"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callApi(body, url, attempt = 1) {
    console.log("Calling API with body -->", body)
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    console.log("API response --> ", data);

    // 1) HTTP-level retry
    if (res.status === 503 || res.status === 423) {
        const headerRetry = res.headers.get("retry-after");
        const waitTime = 60; // wait 60 seconds

        console.warn(`HTTP 503. Waiting ${waitTime}s then retrying (attempt ${attempt})...`);
        await sleep(waitTime * 1000);

        const ok = await askYesNo("Retry the request now?");

        if (!ok) {
            throw new Error("User aborted after rate limit wait.");
        }

        return postDocumentationApi(body, attempt + 1);
    }

    // 2) API-level retry
    // Rate limit:
    if (data?.code === -985 && typeof data?.retry_after === "number") {
        const waitTime = data.retry_after;
        console.warn(`Rate limited (-985). Waiting ${waitTime}s then retrying (attempt ${attempt})...`);
        await sleep(waitTime * 1000);

        const ok = await askYesNo("Retry the request now?");
        if (!ok) {
            throw new Error("User aborted after rate limit wait.");
        }

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
    async execute_shell_command({ cmd }) {
        console.log('Executing action --> ', cmd)
        return callApi({
            apikey: AI_DEVS_API_KEY,
            cmd: cmd
        }, SHELL_URL);
    },

    async verify({ confirmation }) {
        console.log('Verification started')
        if (!confirmation) throw new Error("Confirmation code is required");
        return callApi({
            apikey: AI_DEVS_API_KEY,
            task: "firmware",
            answer: {
                confirmation: confirmation
            },
            VERIFY_URL
        });
    }
};