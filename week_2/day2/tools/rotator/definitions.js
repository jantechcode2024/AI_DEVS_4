export const rotatorTools = [
  {
    type: "function",
    name: "prepare_rotation_list",
    description:
      "Compare the current pipe board state with the target board state and return how many 90-degree clockwise rotations are needed for each cell. Each cell is represented as [TOP, RIGHT, BOTTOM, LEFT].",
    parameters: {
      type: "object",
      properties: {
        current: {
          type: "object",
          description:
            "The current board state as a JSON object, where each key is a cell coordinate like '1x1' and each value is an array of 4 numbers in the order [TOP, RIGHT, BOTTOM, LEFT]."
        },
        target: {
          type: "object",
          description:
            "The target board state as a JSON object, where each key is a cell coordinate like '1x1' and each value is an array of 4 numbers in the order [TOP, RIGHT, BOTTOM, LEFT]."
        }
      },
      required: ["current", "target"],
      additionalProperties: false
    },
    strict: true
  },
  
];