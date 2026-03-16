export const tools = [
  {
    type: "function",
    name: "analyze_csv",
    description: "Fetches CSV from API and analyze it to prepare prompt for classify_product tool. You should analyze all entries in provided CSV, based on that prepare prompt for classify_product tool.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "classify_product",
    description: "Classify product as DNG (dangerous) or NEU (neutral) based on its description. You should send request to the hub to classify product with given prompt. Prompt should classify products based only on their description, without any additional information. Make sure that reactor fuel cassettes are classified as NEU (exception)",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Prompt with code of particular product to classify" },
      },
      required: ["prompt"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "reset_limits",
    description: "Send reset request to hub to reset limits if you are blocked (your prompt used too much tokens), after reset limits you should invoke whole cycle again so: reset -> analyze_csv (file will be changed every 10 min) -> generate new better prompt --> classify_product (for each product).",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  }
];