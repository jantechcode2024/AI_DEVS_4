export const tools = [

    {
        type: "function",
        name: "execute_command",
        description: "Call shell API with command to execute action on virtual linux system.",
        parameters: {
            type: "object",
            properties: {
                cmd: { type: "string", description: "Command to execute in API call" }
            },
            required: ["cmd"],
            additionalProperties: true,
        },
    },
];