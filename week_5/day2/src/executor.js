import { chat, extractToolCalls, extractText, toFunctionCallOutput } from "./api.js";

const MAX_TOOL_ROUNDS = 150;

const executeToolCalls = async (toolCalls, handlers) => {
    console.log(`Executing tool calls: ${toolCalls.length}`);

    return Promise.all(
        toolCalls.map(async (call) => {
            let args = {};

            try {
                args = JSON.parse(call.arguments ?? "{}");
            } catch (error) {
                console.log(`  → ${call.name}(invalid JSON) [call_id=${call.call_id}]`);
                console.log(`    ✗ Error: Invalid tool arguments JSON`);

                return toFunctionCallOutput(call.call_id, {
                    error: "Invalid tool arguments JSON",
                });
            }

            console.log(`  → ${call.name}(${JSON.stringify(args)}) [call_id=${call.call_id}]`);

            try {
                const handler = handlers?.[call.name];
                if (!handler) {
                    throw new Error(`Unknown tool: ${call.name}`);
                }

                const result = await handler(args);
                console.log(`    ✓ Success`);

                return toFunctionCallOutput(call.call_id, result);
            } catch (error) {
                console.log(`    ✗ Error: ${error.message}`);

                return toFunctionCallOutput(call.call_id, {
                    error: error.message,
                });
            }
        })
    );
};

export const processQuery = async (
    query,
    { model, tools, handlers = {}, instructions }
) => {
    // stateless conversation: całą historię trzymasz lokalnie
    let conversation = [
        {
            role: "user",
            content: query,
        },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        console.log(`\n--- ROUND ${round + 1}/${MAX_TOOL_ROUNDS} ---`);
        console.log(`Conversation history length: ${conversation.length} items`);

        const response = await chat({
            model,
            input: conversation,
            tools,
            instructions,
            store: false,
            // NIE wysyłamy include: reasoning — nie używamy o3/o4
        });

        const toolCalls = extractToolCalls(response);

        console.log(`Model tool calls: ${toolCalls.length}`);
        if (toolCalls.length > 0) {
            console.log(
                toolCalls.map((c) => `${c.name}:${c.call_id ?? "no_call_id"}`).join(", ")
            );
        }

        if (toolCalls.length === 0) {
            const text = extractText(response) ?? "No response";
            console.log(`\nA: ${text}`);
            return text;
        }

        // wykonaj wszystkie tool calle z tej rundy
        const toolResults = await executeToolCalls(toolCalls, handlers);

        // Filtrujemy output modelu - zostawiamy tylko typy które API akceptuje z powrotem:
        // "message" i "function_call" — pomijamy reasoning bloki, które psują historię
        const safeOutputItems = response.output.filter(
            (item) => item.type === "function_call" || item.type === "message"
        );

        console.log(
            `Adding to history: ${safeOutputItems.length} model items + ${toolResults.length} tool results`
        );

        // Zachowujemy pełną historię: poprzednia konwersacja + output modelu + wyniki tooli
        conversation = [
            ...conversation,
            ...safeOutputItems,
            ...toolResults,
        ];
    }

    console.log("\nA: Max tool rounds reached");
    return "Max tool rounds reached";
};