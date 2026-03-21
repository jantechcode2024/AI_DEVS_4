export const tools = [

    {
        type: "function", 
        name: "fetch_documentation",
        description: "Fetches documentation for the mail API. No parameters required. Always first action.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false
        }
    },

    {
        type: "function",
        name: "trigger_action",
        description: "Trigger an action from the mail API. Provide 'action' and any other required params",
        parameters: {
            type: "object",
            properties: {
                action: { type: "string" },
            },
            required: ["action"],
            additionalProperties: true
        }
    },

    {
        type: "function",
        name: "verify",
        description: "Send final verification call with all required parameters. If call is successful, response will contain {FLG:...}. If no flag found in the response, you should analyze the response and retry whole process again.",
        parameters: {
            type: "object",
            properties: {
                password: { type: "string", description: "Password found in mailbox via Api" },
                date: { type: "string", description: "Date found in mailbox via Api in format YYYY-MM-DD. If as input you will get different format you should parse it to correct one." },
                confirmation_code: { type: "string", description: "Confirmation code found in mailbox via Api. Starts with SEC...." },
            },
            required: ["password", "date", "confirmation_code"],
            additionalProperties: false
        }
    }

];