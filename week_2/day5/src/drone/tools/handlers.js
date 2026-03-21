import { AI_DEVS_API_KEY } from "../../../../../config.js"

const HUB_URL = "https://hub.ag3nts.org/api/zmail";
const VERIFY_URL = "https://hub.ag3nts.org/verify";
const DRONE_DOC_URL = "https://hub.ag3nts.org/dane/drone.html"

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

    console.log("Successfully sent request to hub");
    return data;
}

export const handlers = {
    async fetch_documentation() {
        const doc = await sendRequest("GET", {}, DRONE_DOC_URL);
        console.log('doc', doc)
        return doc;
    },

    async verify({ instructions }) {
        return sendRequest("POST", {
            apikey: AI_DEVS_API_KEY,
            task: "drone",
            answer: {
                instructions: instructions
            }
        }, VERIFY_URL);
    }
};