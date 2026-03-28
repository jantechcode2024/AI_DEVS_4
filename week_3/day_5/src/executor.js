import { chat, extractToolCalls, extractText, toFunctionCallOutput } from "./api.js";

const MAX_TOOL_ROUNDS = 20;

// Jeśli używasz reasoning models (np. o3/o4/gpt-5 reasoning),
// to to pole pomaga w stateless mode.
// Jeśli nie używasz reasoning modelu, możesz to usunąć.
const DEFAULT_INCLUDE = ["reasoning.encrypted_content"];

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

        const response = await chat({
            model,
            input: conversation,
            tools,
            instructions,
            store: false,
            include: DEFAULT_INCLUDE,
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

        // bardzo ważne:
        // zachowujemy output modelu + function_call_output
        // i wysyłamy całość w następnym requestcie
        conversation = [
            ...conversation,
            ...response.output,
            ...toolResults,
        ];
    }

    console.log("\nA: Max tool rounds reached");
    return "Max tool rounds reached";
};