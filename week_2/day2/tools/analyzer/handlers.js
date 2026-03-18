import { AI_DEVS_API_KEY } from "../../../../config.js";

const FETCH_PNG_URL = `https://hub.ag3nts.org/data/${AI_DEVS_API_KEY}/electricity.png`;
export const handlers = [];
async function fetchPng(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "image/png,*/*" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PNG fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image/png")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Expected image/png, got ${contentType}: ${text.slice(0, 200)}`);
  }

  const ab = await res.arrayBuffer();
  return Buffer.from(ab).toString("base64");
}

export async function fetchGridImageAsDataUrl() {
  const base64 = await fetchPng(FETCH_PNG_URL);
  return `data:image/png;base64,${base64}`;
}