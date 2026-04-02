export const tools = [
  {
    type: "function",
    name: "call_api",
    description: `Call external file system API. 
'action' is the action name.
'params' is a JSON string with ALL additional parameters required by that action.
If action requires no extra params, pass params="{}"`,
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "API action name provided in api documentation"
        },
        params: {
          type: "string",
          description: "JSON string with additional parameters for the action.'"
        }
      },
      required: ["action", "params"],
      additionalProperties: false,
    },
    strict: true
  },


  {
    type: "function",
    name: "analyze_api_documentation",
    description: "Fetches API documentation. and analyze it.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
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
    name: "read_file",
    description: "Read the contents of a file",
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
];