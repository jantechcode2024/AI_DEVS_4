import { resolveModelForProvider } from "../../../config.js";

export const analyzer = {
  model: resolveModelForProvider("google/gemini-3-flash-preview"),
  instructions: `
You are an image analyzer.

You will receive an image to analyze, focus on grid located in the middle of the picture.
The image contains one central 3x3 grid.

Grid interpretation:

1x1 | 1x2 | 1x3
----|-----|----
2x1 | 2x2 | 2x3
----|-----|----
3x1 | 3x2 | 3x3
`,
};