
import path from "path";
import { fileURLToPath } from "url";
import { queryImportantLogs } from "./src/utils/logReader.js";
import { aggregator } from "./src/aggregator.js";
import { tools, handlers } from "./tools/index.js";
import { processQuery } from "./src/executor.js";
import { downloadLatestLogs, LOGS_DIR } from "./src/logFetcher.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  model: aggregator.model,
  tools: tools,
  handlers: handlers,
  instructions: aggregator.instructions,
}

const main = async () => {
  // Download latest file from hub instead of using old local failure.log
  const latestLogPath = await downloadLatestLogs();

  const importantLogPath = path.join(LOGS_DIR, "important_logs.log");

  // Query only important logs from the latest downloaded file
  await queryImportantLogs(latestLogPath, importantLogPath);

  const q = `Compress this logs and send them to hub for verification. Return {FLG:...} as result from response. Logs file path is ${importantLogPath}`;

  await processQuery(q, config);
};



main().catch(console.error);