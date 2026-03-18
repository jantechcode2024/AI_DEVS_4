import { chat, extractToolCalls, extractText } from "./api.js";

const MAX_TOOL_ROUNDS = 30;
const MAX_TOOL_CALLS_PER_ROUND = 5;

function safeParseArgs(raw) {
  if (raw && typeof raw === "object") return raw;
  if (raw == null) return {};
  if (typeof raw !== "string") return {};

  const trimmed = raw.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.log(`    ✗ Invalid JSON in tool arguments: ${trimmed.slice(0, 200)}`);
    return {};
  }
}

const executeToolCalls = async (toolCalls, handlers) => {
  console.log(`Executing tool calls: ${toolCalls.length}`);

  return Promise.all(
    toolCalls.map(async (call) => {
      const args = safeParseArgs(call.arguments);
      console.log(`  → ${call.name}(${JSON.stringify(args)}) [call_id=${call.call_id}]`);

      try {
        const handler = handlers[call.name];
        if (!handler) throw new Error(`Unknown tool: ${call.name}`);

        const result = await handler(args);
        console.log(`    ✓ Success`);

        return {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        };
      } catch (error) {
        console.log(`    ✗ Error: ${error.message}`);

        return {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify({ error: error.message }),
        };
      }
    })
  );
};

function normalizeUserInput(input) {
  // 1. zwykły string
  if (typeof input === "string") {
    return {
      role: "user",
      content: [{ type: "input_text", text: input }],
    };
  }

  // 2. gotowa tablica content, np. [{type: "input_text", ...}, {type: "input_image", ...}]
  if (Array.isArray(input)) {
    return {
      role: "user",
      content: input,
    };
  }

  // 3. pełny obiekt wiadomości
  if (input && typeof input === "object") {
    if (input.role && input.content) {
      return input;
    }

    // 4. wygodny skrót: { text, imageBase64, mimeType }
    if (input.text || input.imageBase64) {
      const content = [];

      if (input.text) {
        content.push({
          type: "input_text",
          text: input.text,
        });
      }

      if (input.imageBase64) {
        content.push({
          type: "input_image",
          image_url: `data:${input.mimeType || "image/png"};base64,${input.imageBase64}`,
        });
      }

      return {
        role: "user",
        content,
      };
    }
  }

  throw new Error("Unsupported input format");
}

export const processQuery = async (
  input,
  { model, tools, handlers, instructions }
) => {
  const chatConfig = { model, tools, instructions };
  let conversation = [normalizeUserInput(input)];

  const executedCallIds = new Set();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    console.log(`\n--- ROUND ${round + 1}/${MAX_TOOL_ROUNDS} ---`);

    const response = await chat({ ...chatConfig, input: conversation });
    const toolCallsRaw = extractToolCalls(response);

    const toolCalls = toolCallsRaw.filter((c) => {
      if (!c.call_id) return true;
      if (executedCallIds.has(c.call_id)) return false;
      return true;
    });

    console.log(`Model tool calls (raw): ${toolCallsRaw.length}, after dedupe: ${toolCalls.length}`);
    console.log(toolCallsRaw.map((c) => `${c.name}:${c.call_id ?? "no_call_id"}`).join(", "));

    if (toolCalls.length === 0) {
      const text = extractText(response) ?? "No response";
      console.log(`\nA: ${text}`);
      return text;
    }

    const limitedToolCalls = toolCalls.slice(0, MAX_TOOL_CALLS_PER_ROUND);

    for (const c of limitedToolCalls) {
      if (c.call_id) executedCallIds.add(c.call_id);
    }

    const toolResults = await executeToolCalls(limitedToolCalls, handlers);

    conversation = [...conversation, ...limitedToolCalls, ...toolResults];
  }

  console.log("\nA: Max tool rounds reached");
  return "Max tool rounds reached";
};