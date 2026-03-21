import {AI_DEVS_API_KEY} from "../../../config.js"

const HUB_URL = "https://hub.ag3nts.org/api/zmail";
const VERIFY_URL = "https://hub.ag3nts.org/verify";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

 
async function sendRequest(body, url = HUB_URL) {
    console.log("Sending request to hub");
    await sleep(5000);
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });


    const data = await res.json().catch(() => null);
    console.log('data is ', data)
    if (!res.ok || data?.error) {
        console.error("Sending request to hub - error")
        const msg =
            data?.error?.message ??
            data?.message ??
            `Call API request failed with status ${res.status}`;
        throw new Error(msg);
    }

    console.log("Successfully sent request to hub")

    return data;
};

export const handlers = {
    async fetch_documentation() {
        return sendRequest({
            apikey: AI_DEVS_API_KEY,
            action: "help",
            page: 1
        });
    },
    async trigger_action(args) {
        console.log("Triggering mail action with args ", args);
        const {action, page, ...params} = args;
        if (!action) throw new Error("Action is always required!");
        const response = await sendRequest({
            apikey: AI_DEVS_API_KEY,
            action: action,
            page: page,
            params: {
                ...params
            }
        });

            console.log("response is", response)
         return response;
    },
    async verify({password, date, confirmation_code}) {
        return sendRequest({
            apikey: AI_DEVS_API_KEY,
            task: "mailbox",
            answer: {
                password,
                date,
                confirmation_code
            }
        }, VERIFY_URL);
    }
};