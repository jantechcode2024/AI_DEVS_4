export const tools = [

    {
        type: "function",
        name: "talk",
        description: "Convert text to speech, send it to API and return transcribed response",
        parameters: {
            type: "object",
            properties: {
                message: {
                    type: "string",
                    description: "The message to convert to speech and send",
                },
            },
            required: ["message"],
            additionalProperties: false,
        },
    },

];