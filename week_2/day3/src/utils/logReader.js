import fs from "node:fs";
import readline from "node:readline";

export async function queryImportantLogs(inputPath, outputPath) {
  const allowedCategories = new Set(["CRIT", "ERRO"]);

  const readStream = fs.createReadStream(inputPath, {
    encoding: "utf-8",
  });

  const writeStream = fs.createWriteStream(outputPath, {
    encoding: "utf-8",
  });

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line) continue;

    const match = line.match(/\]\s\[(CRIT|WARN|ERRO)\]\s/);
    if (match && allowedCategories.has(match[1])) {
      const formattedLine = line.replace(
        /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}):\d{2}/,
        "$1"
      );

      writeStream.write(formattedLine + "\n");
    }
  }

  writeStream.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}