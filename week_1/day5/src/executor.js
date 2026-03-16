import { chat, extractToolCalls, extractText } from "./api.js";

const MAX_TOOL_ROUNDS = 15;
const MAX_TOOL_CALLS_PER_ROUND = 1;

const executeToolCalls = async (toolCalls, handlers) => {
  console.log(`Executing tool calls: ${toolCalls.length}`);

  return Promise.all(
    toolCalls.map(async (call) => {
      const args = JSON.parse(call.arguments ?? "{}");
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

export const processQuery = async (query, { model, tools, handlers, instructions }) => {
  const chatConfig = { model, tools, instructions };
  let conversation = [{ role: "user", content: query }];

  const executedCallIds = new Set();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    console.log(`\n--- ROUND ${round + 1}/${MAX_TOOL_ROUNDS} ---`);

    const response = await chat({ ...chatConfig, input: conversation });
    const toolCallsRaw = extractToolCalls(response);

    // dedupe po call_id (jeśli wrapper zwraca stare outputy ponownie)
    const toolCalls = toolCallsRaw.filter((c) => {
      if (!c.call_id) return true;
      if (executedCallIds.has(c.call_id)) return false;
      return true;
    });

    console.log(`Model tool calls (raw): ${toolCallsRaw.length}, after dedupe: ${toolCalls.length}`);
    console.log(
      toolCallsRaw.map((c) => `${c.name}:${c.call_id ?? "no_call_id"}`).join(", ")
    );

    if (toolCalls.length === 0) {
      const text = extractText(response) ?? "No response";
      console.log(`\nA: ${text}`);
      return text;
    }

    const limitedToolCalls = toolCalls.slice(0, MAX_TOOL_CALLS_PER_ROUND);

    // oznacz jako wykonane (żeby nie odpalić drugi raz)
    for (const c of limitedToolCalls) {
      if (c.call_id) executedCallIds.add(c.call_id);
    }

    const toolResults = await executeToolCalls(limitedToolCalls, handlers);

    conversation = [...conversation, ...limitedToolCalls, ...toolResults];
  }

  console.log("\nA: Max tool rounds reached");
  return "Max tool rounds reached";
};