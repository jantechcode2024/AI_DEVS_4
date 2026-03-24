export const tools = [

    {
        type: "function",
        name: "verify",
        description: "Send final verification call with all required parameters. If call is successful, response will contain {FLG:...}. If no flag found in the response, you should analyze the response and retry whole process again.",
        parameters: {
            type: "object",
            properties: {
                confirmation: { type: "string", description: "Confirmation code found in response in format ECCS-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
            },
            required: ["confirmation"],
            additionalProperties: false
        }
    },
    {
        type: "function",
        name: "execute_shell_command",
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