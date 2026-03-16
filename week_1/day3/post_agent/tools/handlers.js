import { PACKAGES_API_URL, API_KEY, DESTINATION, TAVILY_API_KEY, TAVILY_URL } from "../../../../config.js";


async function postPackagesApi(body) {
  console.log("Posting to Packages API with body:", body);
  const res = await fetch(PACKAGES_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.error) {
    const msg =
      data?.error?.message ??
      data?.message ??
      `Packages API request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function tavilySearch({ query, maxResults = 5 }) {
  const apiKey = TAVILY_API_KEY;
  if (!apiKey) throw new Error("Missing TAVILY_API_KEY env var");

  const safeMax =
    typeof maxResults === "number" ? Math.max(1, Math.min(10, maxResults)) : 5;

  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: safeMax,
      include_answer: true,   // Tavily can provide a short direct answer
      include_raw_content: false,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.error) {
    const msg =
      data?.error?.message ??
      data?.message ??
      `Tavily request failed with status ${res.status}`;
    throw new Error(msg);
  }

  // Normalize to a clean structure for the model
  return {
    query,
    answer: data?.answer ?? null,
    results: Array.isArray(data?.results)
      ? data.results.map((r) => ({
        title: r?.title ?? "",
        url: r?.url ?? "",
        content: r?.content ?? "",
        score: r?.score ?? null,
      }))
      : [],
  };
}

export const handlers = {
  async check_package({ packageId }) {
    if (!packageId) throw new Error("packageId is required");

    return postPackagesApi({
      apikey: API_KEY,
      action: "check",
      packageid: packageId,
    });
  },

  async redirect_package({ packageId, code }) {
    if (!packageId) throw new Error("packageId is required");
    if (!code) throw new Error("code is required");

    return postPackagesApi({
      apikey: API_KEY,
      action: "redirect",
      packageid: packageId,
      destination: DESTINATION,
      code,
    });
  },

  async web_search({ query, maxResults }) {
    if (!query) throw new Error("query is required");
    return tavilySearch({ query, maxResults });
  },
};