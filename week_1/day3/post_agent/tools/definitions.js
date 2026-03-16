export const tools = [
    {
      type: "function",
      name: "check_package",
      description: "Checks state of the package based on provided package id and returns info about it.",
      parameters: {
        type: "object",
        properties: {
          packageId: {
            type: "string",
            description: "The id of the package to check. Example: PKG12345678",
          },
        },
        required: ["packageId"],
        additionalProperties: false,
      },
      strict: true,
    },
    {
      type: "function",
      name: "redirect_package",
      description:
        "Redirects the package to a predefined destination (PWR3847PL). Requires a redirect security code provided by the operator. The API returns a confirmation code that must be communicated back. In answer should return confirmation (code) to operator.",
      parameters: {
        type: "object",
        properties: {
          packageId: {
            type: "string",
            description: "The id of the package to redirect. Example: PKG12345678",
          },
          code: {
            type: "string",
            description: "Redirect security code provided by the operator.",
          },
        },
        required: ["packageId", "code"],
        additionalProperties: false,
      },
      strict: true,
    },
    {
        type: "function",
        name: "web_search",
        description:
          "Fetches up-to-date factual information from the web for user questions like weather, opening hours, events, etc.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (in user language), e.g. 'pogoda Kraków teraz'.",
            },
            maxResults: {
              type: "integer",
              description: "Maximum number of results to return 1.",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
        strict: true,
      }
  ];