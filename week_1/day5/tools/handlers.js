import { AI_DEVS_API_KEY} from "../../config.js";
import { askYesNo } from "./cliPrompt.js";

const CALL_API_URL = "https://hub.ag3nts.org/verify";

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
    async fetch_api_documentation() {

        return postDocumentationApi({
            apikey: AI_DEVS_API_KEY,
            task: "railway",
            answer: { action: "help" },
        });
    },

    async call_api(args) {
        console.log("call_api raw args from model:", args);
        const { action, ...params } = args;
        if (!action) throw new Error("Action is required");
        return postDocumentationApi({
            apikey: AI_DEVS_API_KEY,
            task: "railway",
            answer: {
                action: action,
                ...params
            }

        });
    }
};