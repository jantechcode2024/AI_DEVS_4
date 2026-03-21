export const tools = [

    {
        type: "function",
        name: "fetch_documentation",
        description: "Fetches documentation for the drone API. No parameters required. Always first action. Based on documentation identify all functions that could be used as instructions. Make sure you checked name of the method, analyze param meanings and param example values. Thats important, documentation could contain method with same name but different params!",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false
        }
    },
    {
        type: "function",
        name: "verify",
        description: "Send final verification call with all required parameters. If call is successful, response will contain {FLG:...}. If no flag found in the response, you should analyze the response and retry whole process again, based on hints present in response.",
        parameters: {
            type: "object",
            properties: {
                instructions: {
                    type: "array",
                    description: "Array of string instructions for drone",
                    items: {
                        type: "string"
                    }
                }
            },
            required: ["instructions"],
            additionalProperties: false
        }
    }

]