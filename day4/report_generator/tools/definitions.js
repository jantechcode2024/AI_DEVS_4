export const tools = [
  {
    type: "function",
    name: "read_file",
    description:
      "Read a document by file name from GET https://hub.ag3nts.org/dane/doc/{fileName} and return its content.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        fileName: {
          type: "string",
          description: "File name to fetch, e.g. 'input.md' or 'zalacznik-A.md'."
        }
      },
      required: ["fileName"]
    }
  }
];