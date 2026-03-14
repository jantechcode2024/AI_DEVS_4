export const tools = [
    {
        type: "function",
        name: "fetch_api_documentation",
        description: "Fetches API documentation...",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "call_api",
        description:  "Call railway API. Provide 'action' and any additional required parameters as top-level keys (dynamic), based on /help.",
        parameters: {
          type: "object",
          properties: {
            action: { type: "string" },
          },
          required: ["action"],
          additionalProperties: true,
        },
      },
];