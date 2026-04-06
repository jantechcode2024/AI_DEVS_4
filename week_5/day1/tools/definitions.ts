export const tools = [

    {
        type: "function",
        name: "listen",
        description: "Listen to radio signals, translate them, filtering out and returning to model",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
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
        name: "verify",
        description: "Calling verification request with mandatory data",
        parameters: {
            type: "object",
            properties: {
                cityName: {
                    type: "string",
                    description: "Name of the city user is searching for based on collected radio data."
                },
                cityArea: {
                    type: "string",
                    description: "Area of the city user is searching for based on collected radio data. It should be in decimal format, for example: 123.45. This refers to true mathematical rounding, not truncating the value"
                },
                warehousesCount: {
                    type: "string",
                    description: "How many warehouses are in the city user is searching for based on collected radio data. It should be a whole number, for example: 5 as string"
                },
                phoneNumber: {
                    type: "string",
                    description: "Phone number of the person from the city user is searching for based on collected radio data. It should be in format 1234567890"
                }
            },
            required: ["cityName", "cityArea", "warehousesCount", "phoneNumber"],
            additionalProperties: false
        },
        strict: true
    },




]