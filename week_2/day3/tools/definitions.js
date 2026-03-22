export const tools = [

    {
        type: "function",
        name: "read_file",
        description: "Read the contents of a file",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the file."
            }
          },
          required: ["path"],
          additionalProperties: false
        },
        strict: true
      },

      {
        type: "function",
        name: "write_file",
        description: "Write content to a file (creates or overwrites)",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the file within sandbox"
            },
            content: {
              type: "string",
              description: "Content to write to the file"
            }
          },
          required: ["path", "content"],
          additionalProperties: false
        },
        strict: true
      },

    {
        type: "function",
        name: "verify",
        description: "Send final verification call with all required parameters. If call is successful, response will contain {FLG:...}. If no flag found in the response, you should analyze the response message and try to adjust content of the file according to it.",
        parameters: {
            type: "object",
            properties: {
                content: { type: "string", description: "Content of file with logs that should be send into hub to verify." }
            },
            required: ["content"],
            additionalProperties: false
        }
    }
]