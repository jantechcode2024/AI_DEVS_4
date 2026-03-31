import { AI_API_KEY, EXTRA_API_HEADERS, RESPONSES_API_ENDPOINT } from "../../../../../config.js";

export const chat = async ({ model, input, tools, toolChoice = "auto", instructions }) => {
    const body = { model, input };

    if (tools) body.tools = tools;
    if (tools) body.tool_choice = toolChoice;
    if (instructions) body.instructions = instructions;

    // Debug — sprawdź co dokładnie wysyłasz do API
    //console.log("📤 Sending to API:", JSON.stringify(body, null, 2));

    const response = await fetch(RESPONSES_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
            ...EXTRA_API_HEADERS
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const res = await response.json();

    // Debug — sprawdź co dostajesz z API
    //console.log("📥 API raw response:", JSON.stringify(res, null, 2));

    return res;
};

export const extractToolCalls = (response) =>
    response.output.filter((item) => item.type === "function_call");

export const extractText = (response) => {
    if (typeof response?.output_text === "string" && response.output_text.trim()) {
        return response.output_text;
    }

    const message = response.output.find((item) => item.type === "message");
    return message?.content?.[0]?.text ?? null;
};