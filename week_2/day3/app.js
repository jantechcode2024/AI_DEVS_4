import { createDriver, verifyConnection } from "./src/graph/driver.js";
import { ensureSchema } from "./src/graph/schema.js";
import { indexWorkspace } from "./src/graph/indexer.js";
import { createTools } from "./src/agent/tools.js";
import { createReadline, runRepl } from "./src/repl.js";
import { onShutdown } from "./src/helpers/shutdown.js";
import { logStats } from "./src/helpers/stats.js";
import log from "./src/helpers/logger.js";





const main = async () => {
  log.box("Graph RAG Agent\nCommands: 'exit' | 'clear' | 'reindex' | 'reindex --force'");
  // 1 Connect to neo4j
  log.start('Connecting to NEO4J DB...');
  const driver = createDriver({
    uri: process.env.NEO4J_URI,
    username: process.env.NEO4J_USERNAME,
    password: process.env.NEO4J_PASSWORD,
  });

  // Check if connected to NEO4J
  await verifyConnection(driver);
  log.success("Neo4j connected");

  log.start("Ensuring graph schema...");
  await ensureSchema(driver);

  // Scan workspace folder to index files in - it's needed to later on analyze it 
  log.start('Indexing workspace...');
  await indexWorkspace(driver, "workspace")
  log.success('Workspace indexed!');

  // Agent tools 
  const tools = createTools(driver);

  const rl = createReadline();

  const shutdown = onShutdown(async () => {
    logStats();
    await driver.close();
    rl.close();
    log.success("Shutdown complete");
  });

  await runRepl({ tools, rl, driver });
  await shutdown();
};

main().catch((err) => {
  log.error("Startup error", err.message);
  process.exit(1);
});