import { AI_API_KEY, EXTRA_API_HEADERS, RESPONSES_API_ENDPOINT } from "../../../config.js";

/**
 * Minimal wrapper around the Responses API.
 * Works with your `processQuery` tool-loop pattern.
 *
 * Expected conversation `input` items:
 * - User messages: { role: "user", content: "..." }
 * - Tool calls (from model): { type: "function_call", name, arguments, call_id }
 * - Tool outputs (from you): { type: "function_call_output", call_id, output }
 */

const toResponsesInput = (input) => {
  if (!Array.isArray(input)) return input;

  return input.map((item) => {
    // Pass tool events through as-is (Responses API accepts them)
    if (item?.type === "function_call" || item?.type === "function_call_output") return item;

    // Convert simple {role, content:"..."} to Responses API content array
    if (item?.role && typeof item?.content === "string") {
      return {
        role: item.role,
        content: [{ type: "input_text", text: item.content }],
      };
    }

    // If already structured or unknown shape, pass through
    return item;
  });
};

export const chat = async ({ model, input, tools, toolChoice = "auto", instructions }) => {
  const body = { model, input: toResponsesInput(input) };

  if (tools) body.tools = tools;
  if (tools) body.tool_choice = toolChoice;
  if (instructions) body.instructions = instructions;

  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

export const extractToolCalls = (response) =>
  (response?.output ?? []).filter((item) => item?.type === "function_call");

export const extractText = (response) => {
  // Fast path provided by Responses API
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  // Fallback: find a message item and pull text from content
  const message = (response?.output ?? []).find((item) => item?.type === "message");

  // Sometimes content is [{type:"output_text", text:"..."}]
  const content = message?.content ?? [];
  const firstText =
    content.find((c) => c?.type === "output_text" && typeof c?.text === "string")?.text ??
    content.find((c) => typeof c?.text === "string")?.text ??
    content?.[0]?.text ??
    null;

  return typeof firstText === "string" && firstText.trim() ? firstText : null;
};