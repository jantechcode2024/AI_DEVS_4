export const tools = [
  {
    type: "function",
    name: "suspect_location",
    description: "Given a suspect's name and surname, return their last known locations.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The suspect's first name."
        },
        surname: {
          type: "string",
          description: "The suspect's surname."
        }
      },
      required: ["name", "surname"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "geocode_city",
    description: "Get latitude and longitude for a Polish city name.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Polish city name"
        }
      },
      required: ["city"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "get_suspect_access",
    description: "Get suspect access level and return it together with a suspicious power plant code.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The suspect's first name."
        },
        surname: {
          type: "string",
          description: "The suspect's surname."
        },
        birthYear: {
          type: "number",
          description: "The suspect's year of birth."
        },
        powerPlant: {
          type: "string",
          description: "Power plant code."
        }
      },
      required: ["name", "surname", "birthYear", "powerPlant"],
      additionalProperties: false
    },
    strict: true
  }
];