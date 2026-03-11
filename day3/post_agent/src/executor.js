import { chat, extractToolCalls, extractText } from "./api.js";
import { loadSessionMessages, saveSessionMessages } from "../sessionStore.js";

const MAX_TOOL_ROUNDS = 3;

async function executeToolCalls(toolCalls, handlers) {
  return Promise.all(
    toolCalls.map(async (call) => {
      let args = call.arguments;
      if (typeof args === "string") {
        try { args = JSON.parse(args); } catch {}
      }

      const handler = handlers?.[call.name];
      if (!handler) {
        return {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify({ error: `No handler implemented for tool: ${call.name}` }),
        };
      }

      try {
        const result = await handler(args);
        return {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        };
      } catch (e) {
        return {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify({ error: e?.message ?? String(e) }),
        };
      }
    })
  );
}

export const processQuery = async (query, { model, tools, handlers, instructions }) => {
  const userMsg = typeof query === "string" ? query : query?.msg;
  const sessionId = query?.sessionID;

  if (!userMsg) throw new Error("processQuery: query.msg is required");
  if (!sessionId) throw new Error("processQuery: query.sessionId is required (for disk sessions)");

  const chatConfig = { model, tools, instructions };

  const history = await loadSessionMessages(sessionId);

  let conversation = [...history, { role: "user", content: userMsg }];

  await saveSessionMessages(sessionId, conversation);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await chat({ ...chatConfig, input: conversation });
    const toolCalls = extractToolCalls(response) ?? [];

    if (toolCalls.length === 0) {
      const text = extractText(response) ?? "No response";

      conversation = [...conversation, { role: "assistant", content: text }];
      await saveSessionMessages(sessionId, conversation);

      return { msg: text };
    }

    const toolOutputs = await executeToolCalls(toolCalls, handlers);
    console.log('--- ADDING CONVERSATION ---');
    conversation = [...conversation, ...toolCalls, ...toolOutputs];
    await saveSessionMessages(sessionId, conversation);
  }

  const text = "Max tool rounds reached.";
  conversation = [...conversation, { role: "assistant", content: text }];
  await saveSessionMessages(sessionId, conversation);
  return { msg: text };
};