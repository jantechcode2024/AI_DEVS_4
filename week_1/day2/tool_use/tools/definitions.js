export const tools = [
    {
        type: "function",
        name: "list_files",
        description: "List files in the sandboxed filesystem.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path to list files from, relative to the sandbox root. Use '.' to list from the root."
                }
            },
            required: ["path"],
            additionalProperties: false
        },
        strict: true
    }
]