import path from "path";
import { fileURLToPath } from "url";

import fs from "fs/promises";
import { analyzer } from "./src/analyzer.js";
import { buildRotationSequence, sendRotationSequence } from "./src/rotator.js";

import { tools as analyzerTools, handlers as analyzerHandlers } from "./tools/analyzer/index.js";
import { rotatorTools as rotatorTools, rotatorHandlers as rotatorHandlers } from "./tools/rotator/index.js";
import { processQuery } from "./src/executor.js";
import { mapConnections } from "./coordinatesConverter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  model: analyzer.model,
  analyzerTools,
  analyzerHandlers,
  instructions: analyzer.instructions
};

const queries = [
  "What do you see in this picture?",
  "Could you please focus only on central grid? what is the dimension and how many cells you are able to see?",
  "So when you see individual cells, could you analyze each cell separately and describe shape of the pipe inside them? Return it as pure json with format { cell: '1x1', description: 'A **T-shaped** pipe connecting the top and bottom sides, with a branch extending to the right' }, IMPORTANT: description should contain info about what directions pipe is connected to.",
]


const main = async () => {
  const currentBoard = await processQueriesForImage("electricity.png");
  const resultBoard = await processQueriesForImage("result.png");

  const currentResultCords = await mapToCoordsBoard(currentBoard);
  const finalResultCords = await mapToCoordsBoard(resultBoard);


  console.log("\n=== CURRENT RESULT ===");
  console.log(currentResultCords);


  console.log("\n=== FINAL RESULT ===");
  console.log(finalResultCords);

  const rotationMap = await rotatorHandlers.prepare_rotation_list({
    current: currentResultCords,
    result: finalResultCords
  });
  
  const sequence = buildRotationSequence(rotationMap);
  const res = await sendRotationSequence(sequence);
  return res; 

};

async function mapToCoordsBoard(board) {
  return mapConnections(parseModelJson(board));
}

async function processQueriesForImage(img) {
  const imagePath = path.join(__dirname, img);
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  let res = null

  for (const query of queries) {
    console.log(`\n--- Processing: ${query} ---`);
    const result = await processQuery({
      text: query,
      imageBase64: base64Image,
      mimeType: "image/png"
    }, config);
    res = result;
  }

  return res;
}

function parseModelJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned);
}

main().catch(console.error);