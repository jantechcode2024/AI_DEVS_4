import { createReadStream } from "fs";
import { access, readFile } from "fs/promises";
import path from "path";
import readline from "readline";


/**
 * Find values in one CSV column where another column matches a given value.
 *
 * Example:
 * file: connections.csv
 * itemCode,cityCode
 * 8R5ENT,Y8L2KM
 * J1NRK9,J7M3WB
 * J1NRK9,L8Y2FN
 * X6L46D,G4H6VP
 *
 * findCsvValues("connections.csv", "itemCode", "J1NRK9", "cityCode")
 * => ["J7M3WB", "L8Y2FN"]
 */
export async function findCsvValues(fileName, matchField, matchValue, returnField) {
  const filePath = path.join(process.cwd(), fileName);

  try {
    await access(filePath);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  const stream = createReadStream(filePath, {
    encoding: "utf8",
    highWaterMark: 64 * 1024,
  });

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let headers = null;
  let matchIndex = -1;
  let returnIndex = -1;
  const results = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (!headers) {
      headers = line.split(",").map(h => h.trim());
      matchIndex = headers.indexOf(matchField);
      returnIndex = headers.indexOf(returnField);

      console.log('headers ', headers);
      console.log('matchVal ', matchValue)

      if (matchIndex === -1) {
        throw new Error(`Column not found: ${matchField}`);
      }
      if (returnIndex === -1) {
        throw new Error(`Column not found: ${returnField}`);
      }

      continue;
    }

    const cols = line.split(",").map(v => v.trim());
    if (cols[matchIndex] === matchValue) {
      console.log('found...')
      console.log(cols[returnIndex])
      results.push(cols[returnIndex]);
    }
  }
  console.log('results is ' ,results)
  return results;
}

export async function readCsv(path) {
  return await readFile(path, "utf8");
}