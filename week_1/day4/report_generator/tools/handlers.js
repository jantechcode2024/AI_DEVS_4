import { AI_DEVS_API_KEY } from "../../../config.js";

export const handlers = {
  /**
   * Tool: read_file
   * Fetches a document from: https://hub.ag3nts.org/dane/doc/{fileName}
   */
  async read_file({ fileName }) {
    const url = `https://hub.ag3nts.org/dane/doc/${encodeURIComponent(fileName)}`;
    console.log(`Fetching file from URL: ${url}`);
    const response = await fetch(url, { method: "GET" });
    console.log(`Received response: ${response.status} ${response.statusText} for file: ${fileName}`);
    const rawText = await response.text();

    console.log(`Content of ${fileName}:\n${rawText.substring(0, 500)}...`); // Log first 500 chars for debugging

    if (!response.ok) {
      throw new Error(`read_file error: ${response.status} ${response.statusText} - ${rawText}`);
    }

    // Return plain text so the agent can parse includes/templates itself.
    return { fileName, content: rawText };
  },

  
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}