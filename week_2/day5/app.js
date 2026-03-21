import { mapAnalyzer } from "./src/map_analyzer/mapAnalyzer.js";
import { drone } from "./src/drone/drone.js";
import { tools, handlers } from "./src/drone/tools/index.js"

import { processQuery } from "./src/map_analyzer/executor.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const mapAnalyzerConfig = {
  model: mapAnalyzer.model,
  instructions: mapAnalyzer.instructions
};

const droneConfig = {
  model: drone.model,
  tools,
  handlers,
  instructions: drone.instructions,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queries = [
  `
Analyze the image with the red grid overlay.

Task:
Find the grid cell containing the dam with very bright, intense blue water. Dont focus too much on details!

Rules:
- The answer must be the coordinates of the grid cell only.
- Format: COLUMNxROW
- First value = column
- Second value = row
- Example: 1x2
- Do not describe anything.
- Do not explain your reasoning.
- Return only one plain string.

Important:
- Use the red grid cells as the coordinate system.
- If the dam spans multiple cells, return the cell containing the center of the dam.

Final answer format:
1x2
  `
];

const main = async () => {
  const destinationId = "PWR6132PL"
  const bombCoordinates = await queryCoordinates();
  const [col, row] = bombCoordinates.split("x").map(Number);

  const droneQ = `Based on drone documentation change it destination to destination ID ${destinationId} and coordinates to send the drone to x = ${col} and y = ${row} 
  As an output you should return {FLG:...},
   if you don't get it from verification response, you need to take into account the hint from response and try again with adjusted params.`;

  await processQuery(droneQ, droneConfig)
};

async function queryCoordinates() {
  const imagePath = path.join(__dirname, "map.png");
  const coordinatesPath = path.join(__dirname, "coordinates.txt");

  try {
    const existingValue = await fs.readFile(coordinatesPath, "utf-8");
    const trimmedValue = existingValue.trim();

    if (trimmedValue) {
      console.log("Final result is", trimmedValue);
      return trimmedValue;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");

  let res = null;

  for (const query of queries) {
    console.log(`\n--- Processing: ${query} ---`);
    const result = await processQuery(
      {
        text: query,
        imageBase64: base64Image,
        mimeType: "image/png"
      },
      mapAnalyzerConfig
    );
    res = result;
  }

  await fs.writeFile(coordinatesPath, String(res).trim(), "utf-8");

  return res;
}

main().catch(console.error);