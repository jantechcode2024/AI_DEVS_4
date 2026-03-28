export const tools = [
  {
    type: "function",
    name: "call_api",
    description: "Call tool API. Provide 'query' and any additional required parameters as top-level keys (dynamic), based on values returned.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "External url to call" },
        query: { type: "string", description: "Query to execute external tool" },
      },
      required: ["url", "query"],
      additionalProperties: true,
    },
  },

  {
    type: "function",
    name: "verify",
    description: "Send final verification call with all required parameters. If call is successful, response will contain {FLG:...}. If no flag found in the response, you should analyze the response message and try to adjust content of the file according to it.",
    parameters: {
      type: "object",
      properties: {
        moves: {
          type: "array",
          description: "Moves containing vehicles and commands like up,down",
          items: {
            "type": "string"
          }
        }
      },
      required: ["moves"],
      additionalProperties: false
    }
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
];