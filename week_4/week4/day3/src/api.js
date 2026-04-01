import { AI_API_KEY, EXTRA_API_HEADERS, RESPONSES_API_ENDPOINT } from "../../../../config.js";

export const chat = async ({
    model,
    input,
    tools,
    toolChoice = "auto",
    instructions,
    include,
    store = false,
}) => {
    const body = {
        model,
        input,
        store, // na Twoim Azure ma być false
    };

    if (tools?.length) {
        body.tools = tools;
        body.tool_choice = toolChoice;
    }

    if (instructions) body.instructions = instructions;
    if (include?.length) body.include = include;

    const response = await fetch(RESPONSES_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
            ...EXTRA_API_HEADERS,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
};

export const extractToolCalls = (response) =>
    response?.output?.filter((item) => item.type === "function_call") ?? [];

export const extractText = (response) => {
    if (typeof response?.output_text === "string" && response.output_text.trim()) {
        return response.output_text;
    }

    const message = response?.output?.find((item) => item.type === "message");
    if (!message?.content?.length) return null;

    const textParts = message.content
        .filter((item) => item.type === "output_text" || item.type === "text")
        .map((item) => item.text)
        .filter(Boolean);

    return textParts.length ? textParts.join("\n") : null;
};

export const toFunctionCallOutput = (callId, output) => ({
    type: "function_call_output",
    call_id: callId,
    output: typeof output === "string" ? output : JSON.stringify(output),
});