import { chat, extractToolCalls, extractText } from "./api.js";

const MAX_TOOL_ROUNDS = 20;
const MAX_TOOL_CALLS_PER_ROUND = 1;

const executeToolCalls = async (toolCalls, handlers) => {
    return Promise.all(
        toolCalls.map(async (call) => {
            const args = JSON.parse(call.arguments ?? "{}");
            console.log(`  → ${call.name}(${JSON.stringify(args)}) [call_id=${call.call_id}]`);

            try {
                const handler = handlers[call.name];
                if (!handler) throw new Error(`No handler for tool: ${call.name}`);

                const result = await handler(args);
                console.log(`  ✅ Result [${call.name}]:`, JSON.stringify(result, null, 2));

                return {
                    type: "function_call_output",
                    call_id: call.call_id,
                    output: JSON.stringify(result ?? "null"),
                };
            } catch (error) {
                console.error(`  ✗ Error [${call.name}]: ${error.message}`);
                return {
                    type: "function_call_output",
                    call_id: call.call_id,
                    output: JSON.stringify({
                        error: error.message,
                        hint: `Required fields missing. Use ALL data returned by get_resource_data (id, page, title, content).`
                    }),
                };
            }
        })
    );
};

export async function processQuery(query, config) {
    // Responses API — input to tablica wiadomości
    let conversation = [
        { role: "user", content: query }
    ];

    for (let round = 1; round <= MAX_TOOL_ROUNDS; round++) {
        console.log(`\n--- ROUND ${round}/${MAX_TOOL_ROUNDS} ---`);

        const response = await chat({
            model: config.model,
            instructions: config.instructions,
            tools: config.tools,
            input: conversation,        // ← pełna historia konwersacji
        });

        const toolCalls = extractToolCalls(response);
        const text = extractText(response);

        if (toolCalls.length === 0) {
            console.log("✅ Final answer:", text);
            return text;
        }

        console.log(`Model tool calls: ${toolCalls.length}`);

        // Dodaj function_call do konwersacji
        for (const call of toolCalls) {
            conversation.push({
                type: "function_call",
                call_id: call.call_id,
                name: call.name,
                arguments: call.arguments,
            });
        }

        const limitedToolCalls = toolCalls.slice(0, MAX_TOOL_CALLS_PER_ROUND);
        const toolResults = await executeToolCalls(limitedToolCalls, config.handlers);

        // Dodaj function_call_output do konwersacji
        for (const result of toolResults) {
            conversation.push(result);
        }

        console.log("📋 Conversation length:", conversation.length);
        conversation.forEach((msg, i) => {
            console.log(`  [${i}] type=${msg.type ?? msg.role} | ${JSON.stringify(msg).slice(0, 120)}`);
        });
    }

    console.warn("⚠️ Max tool rounds reached");
}