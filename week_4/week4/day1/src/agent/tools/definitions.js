export let tools = [
    {
        type: "function",
        name: "fetch_api_documentation",
        description: "Fetches API documentation. MUST be called first before using call_api.",
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
        description: `Call the API with action and ALL required parameters as separate top-level keys. Use only when user ask you to change resource!
CORRECT:   { "action": "update", "page": "incydenty", "id": "abc123", "title": "new title" }
INCORRECT: { "action": "update','page':'incydenty" }`,
        parameters: {
            type: "object",
            properties: {
                action: {
                    type: "string",
                    description: "Action to perform: update, help, done"
                },
                page: {
                    type: "string",
                    description: "Page section: incydenty, notatki, zadania"
                },
                id: {
                    type: "string",
                    description: "32-char hex resource ID from get_resource_data"
                },
                title: {
                    type: "string",
                    description: "New title (optional for update)"
                },
                content: {
                    type: "string",
                    description: "New content (optional for update)"
                },
                done: {
                    type: "string",
                    enum: ["YES", "NO"],
                    description: "YES or NO — ONLY for page 'zadania'. NEVER send this field for 'incydenty' or 'notatki'."
                }
            },
            required: ["action", "page", "id"],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_resource_data",
        description: "Scrapes a specific resource from the website. Returns: id, page, title, content.",
        parameters: {
            type: "object",
            properties: {
                tab: {
                    type: "string",
                    description: "Navigation tab: incydenty, zadania, notatki",
                },
                keyword: {
                    type: "string",
                    description: "Keyword to click on within the tab, e.g. city name",
                },
            },
            required: ["tab", "keyword"],
            additionalProperties: false,
        },
    },


  {
    type: "function",
    name: "write_file",
    description: "Write content to a file (creates or overwrites)",
    parameters: {
      type: "object",
      properties: {
        relativePath: {
          type: "string",
          description: "Relative path to the file, it should be name of resource user asked for."
        },
        content: {
          type: "string",
          description: "Content to write to the file"
        }
      },
      required: ["relativePath", "content"],
      additionalProperties: false
    },
    strict: true
  },

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
},

  {
    type: "function",
    name: "read_file",
    description: "Read the contents of a file. When user asks from any information first check if you have file and open it.",
    parameters: {
      type: "object",
      properties: {
        relativePath: {
          type: "string",
          description: "Relative path to the file."
        }
      },
      required: ["relativePath"],
      additionalProperties: false
    },
    strict: true
  },
];

export function updateCallApiTool(apiDocs) {
    const callApiTool = tools.find(t => t.name === "call_api");
    if (!callApiTool) return;
    callApiTool.description = `Call the API. Documentation: ${apiDocs}
CORRECT:   { "action": "update", "page": "incydenty", "id": "abc123", "title": "new title" }
INCORRECT: { "action": "update','page':'incydenty" }`;
    console.log("✅ call_api tool updated with API docs");
}