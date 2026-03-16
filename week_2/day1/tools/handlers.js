import { AI_DEVS_API_KEY } from "../../../config.js";

const CLASSIFY_URL = "https://hub.ag3nts.org/verify";
const CSV_URL = `https://hub.ag3nts.org/data/${AI_DEVS_API_KEY}/categorize.csv`

async function postClassifyApi(body) {
  console.log("Posting to Classify API with body:", body);
  const res = await fetch(CLASSIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.error) {
    const msg =
      data?.error?.message ??
      data?.message ??
      `Classify API request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function getCsvApi() {
  console.log("Fetching csv from url ", CSV_URL);

  const res = await fetch(CSV_URL, {
    method: "GET",
    headers: {
      Accept: "text/csv,text/plain,*/*",
      "Content-Type": "application/json",
    }
  });

  console.log('Result is ', res)
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(
      `Classify API request failed with status ${res.status}: ${text.slice(0, 200)}`
    );
  }

  // Minimalny parser CSV dla formatu: code,description + opisy w cudzysłowach
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length === 0) return [];

  const header = lines.shift().trim();
  if (header !== "code,description") {
    throw new Error(`Unexpected CSV header: ${header}`);
  }

  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;

    // split tylko po pierwszym przecinku: code,rest
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) continue;

    const code = line.slice(0, commaIdx).trim();
    let description = line.slice(commaIdx + 1).trim();

    // zdejmij cudzysłowy jeśli są i od-escape'uj podwójne ""
    if (description.startsWith('"') && description.endsWith('"')) {
      description = description.slice(1, -1).replace(/""/g, '"');
    }

    rows.push({ code, description });
  }

  return rows;
}

export const handlers = {
  async analyze_csv() {
    return getCsvApi();
  },

  async classify_product({ prompt }) {
    if (!prompt) throw new Error("Prompt is required");
    console.log("Classify product with prompt:", prompt);
    return postClassifyApi({
      apikey: AI_DEVS_API_KEY,
      task: "categorize",
      answer: {prompt: prompt}
    });
  },

  async reset_limits() {
      console.log("Resetting limits with query:", query, "and maxResults:", maxResults);
      // Jeśli endpoint resetowania limitów wymaga jakiegoś ciała, dodaj je tutaj
      return postClassifyApi({
        apikey: AI_DEVS_API_KEY,
        task: "categorize",
        answer: {prompt: "reset"}
      });

  },
};